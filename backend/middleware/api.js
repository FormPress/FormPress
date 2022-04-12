const path = require('path')
const fs = require('fs')
const archiver = require('archiver')

const { getPool } = require(path.resolve('./', 'db'))

const {
  mustHaveValidToken,
  paramShouldMatchTokenUserId,
  userShouldOwnSubmission,
  userShouldOwnForm,
  userHavePermission,
  userHaveFormLimit,
  mustBeAdmin
} = require(path.resolve('middleware', 'authorization'))

const reactDOMServer = require('react-dom/server')
const React = require('react')
const Renderer = require(path.resolve('script', 'transformed', 'Renderer'))
  .default
const port = parseInt(process.env.SERVER_PORT || 3000)
const { FP_ENV, FP_HOST } = process.env
const BACKEND = FP_ENV === 'development' ? `${FP_HOST}:${port}` : FP_HOST
const { storage, model, error } = require(path.resolve('helper'))
const formModel = model.form
const formPublishedModel = model.formpublished
const { updateFormPropsWithNewlyAddedProps } = require(path.resolve(
  './',
  'helper',
  'oldformpropshandler.js'
))

module.exports = (app) => {
  const handleCreateForm = async (req, res) => {
    const form = req.body
    const { user_id } = req.params

    if (typeof form.id !== 'undefined' && form.id !== null) {
      // Existing form should update!!!
      const result = await formModel.update({ form })

      const responseObject = {
        status: 'updated',
        id: form.id,
        updated_at: null
      }

      if (result.length > 0) {
        responseObject.updated_at = result[0].updated_at
      }

      res.json(responseObject)
    } else {
      // New Form
      const result = await formModel.create({ user_id, form })

      res.json({ status: 'done', id: result.insertId })
    }
  }

  app.put(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userHavePermission,
    handleCreateForm
  )

  app.post(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userHavePermission,
    userHaveFormLimit('user_id'),
    handleCreateForm
  )

  // return forms of given user id
  app.get(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const user_id = req.params.user_id

      res.json((await formModel.list({ user_id })) || [])
    }
  )

  // return single form via id
  app.get(
    '/api/users/:user_id/forms/:form_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnForm('user_id', 'form_id'),
    async (req, res) => {
      const { form_id } = req.params

      if (req.query.published === 'true') {
        res.json((await formPublishedModel.get({ form_id })) || {})
      } else {
        res.json((await formModel.get({ form_id })) || {})
      }
    }
  )

  //return new or last updated form
  app.get(
    '/api/users/:user_id/editor',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id } = req.params

      if (
        res.locals.auth.permission.admin ||
        res.locals.auth.permission.formLimit === 0
      ) {
        res.status(200).json({ message: 'new' })
      } else {
        const db = await getPool()
        const result = await db.query(
          `SELECT COUNT(\`id\`) AS \`count\` FROM \`form\` WHERE user_id = ? AND deleted_at IS NULL`,
          [user_id]
        )

        if (parseInt(res.locals.auth.permission.formLimit) > result[0].count) {
          res.status(200).json({ message: 'new' })
        } else {
          const lastForm = await db.query(
            `SELECT \`id\` FROM \`form\` WHERE user_id = ? ORDER BY \`updated_at\` DESC LIMIT 1`,
            [user_id]
          )
          const lastFormId = lastForm[0].id

          res.status(200).json({ message: lastFormId })
        }
      }
    }
  )

  // return form questions
  app.get('/api/users/:user_id/forms/:form_id/elements', async (req, res) => {
    const { form_id } = req.params

    res.json((await formModel.get({ form_id })).props.elements || [])
  })

  //return form validators
  app.get('/api/form/element/validators', async (req, res) => {
    const elementQuery = req.query.elements.split(',')

    const elementValidators = {}

    elementQuery.forEach((element) => {
      elementValidators[element] =
        require(path.resolve('script', 'transformed', 'elements', `${element}`))
          .default.helpers || 'unset'
    })

    const output = JSON.stringify(
      elementValidators, //transform element helper functions to string
      (key, value) => (typeof value === 'function' ? value.toString() : value),
      2
    )

    res.json(output)
  })

  // publish form, takes latest form and publishes it
  app.post(
    '/api/users/:user_id/forms/:form_id/publish',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id, form_id } = req.params

      const form = await formModel.get({ form_id })

      if (form !== false) {
        form.props = updateFormPropsWithNewlyAddedProps(form.props)

        await formPublishedModel.create({ user_id, form })

        res.json({ message: 'Published' })
      } else {
        // TODO: handle status 404, it is set to 200 because of
        // Unit tests was expecting HTTP200. Unit tests should be improved to handle
        // When form is not found and when form is found
        res.status(200).json({ message: 'Form not found' })
      }
    }
  )

  // delete single form via id
  app.delete(
    '/api/users/:user_id/forms/:form_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { form_id } = req.params

      await formModel.delete({ form_id })

      res.json({ message: 'deleted' })
    }
  )

  // return submissions of given form id
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { form_id } = req.params
      const { orderBy, desc } = req.query
      const db = await getPool()
      let query = 'SELECT * FROM `submission` WHERE form_id = ?'

      if (typeof orderBy !== 'undefined') {
        if (['created_at', 'deleted_at', 'updated_at'].includes(orderBy)) {
          query += ` ORDER BY ${orderBy}`

          if (desc === 'true') {
            query += ' DESC'
          } else {
            query += ' ASC'
          }
        }
      }

      const result = await db.query(query, [form_id])

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  // return submissions of given form id and version number
  app.get(
    '/api/users/:user_id/forms/:form_id/:version_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { form_id, version_id } = req.params
      const result = await formPublishedModel.get({ form_id, version_id })

      if (result !== false) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  // return csv export of incoming submission IDS
  app.post(
    '/api/users/:user_id/forms/:form_id/CSVExport',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { form_id } = req.params
      const ids = req.body.submissionIds
      const db = await getPool()

      const result = await db.query(
        `
        SELECT * FROM \`entry\`
          WHERE form_id = ? AND submission_id IN (${ids
            .map(() => '?')
            .join(',')})
      `,
        [form_id, ...ids]
      )
      const submissionsResult = await db.query(
        `
        SELECT * FROM \`submission\`
          WHERE form_id = ? AND id IN (${ids.map(() => '?').join(',')})
      `,
        [form_id, ...ids]
      )
      const formResult = await formModel.get({ form_id })

      /*
        TODO: returning HTTP200 here is wrong. This is done since unit tests
        mocking db does not support mocking 3 sequencial SQL queries.

        We should add more SQL behaviour to config/endpoints.js and
        properly extend unit tests
      */
      if (formResult === false) {
        //form not found
        return res.status(200).json({ message: 'Form not found' })
      }

      const form = formResult
      const CSVData = {}
      const submissions = {}

      for (const submission of submissionsResult) {
        submissions[submission.id] = submission
      }

      for (const entry of result) {
        const questionId = entry.question_id
        const submissionId = entry.submission_id
        const submission = submissions[submissionId.toString()]

        if (typeof CSVData[submissionId] === 'undefined') {
          CSVData[submissionId] = {
            submissionId,
            createdAt: submission.created_at
          }
        }

        CSVData[submissionId][questionId] = entry.value
      }

      const createCsvStringifier = require('csv-writer')
        .createObjectCsvStringifier
      const header = [
        { id: 'submissionId', title: 'ID' },
        { id: 'createdAt', title: 'CREATED_AT' }
      ]

      for (const element of form.props.elements) {
        header.push({
          id: element.id.toString(),
          title: element.label
        })
      }

      const csvStringifier = createCsvStringifier({
        header
      })
      const csv =
        csvStringifier.getHeaderString() +
        csvStringifier.stringifyRecords(Object.values(CSVData))

      res.json({
        content: csv,
        filename: `${form.title}-${new Date().getTime()}.csv`
      })
    }
  )

  //delete submissions
  app.delete(
    '/api/users/:user_id/forms/:form_id/deleteSubmission',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { form_id, user_id } = req.params
      const ids = req.body.submissionIds
      const db = await getPool()

      await db.query(
        `
        DELETE FROM \`entry\`
          WHERE form_id = ? AND submission_id IN (${ids
            .map(() => '?')
            .join(',')})
      `,
        [form_id, ...ids]
      )

      await db.query(
        `
        DELETE FROM \`submission\`
          WHERE form_id = ? AND id IN (${ids.map(() => '?').join(',')})
      `,
        [form_id, ...ids]
      )

      const uploadName = await db.query(
        `
      SELECT \`upload_name\` FROM \`storage_usage\` WHERE user_id = ? AND form_id = ? AND submission_id IN (${ids
        .map(() => '?')
        .join(',')})
      `,
        [user_id, form_id, ...ids]
      )

      await db.query(
        `
        DELETE FROM \`storage_usage\`
          WHERE user_id = ? AND form_id = ? AND submission_id IN (${ids
            .map(() => '?')
            .join(',')})
      `,
        [user_id, form_id, ...ids]
      )

      if (uploadName.length > 0) {
        uploadName.forEach((fileName) => {
          storage.deleteFile(fileName.upload_name)
        })
      }
      res.json({ success: true })
    }
  )

  // return entries of given submission id
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id/entries',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { submission_id } = req.params
      const db = await getPool()
      const result = await db.query(
        `
        SELECT * FROM \`entry\` WHERE submission_id = ?
      `,
        [submission_id]
      )

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  //download uploaded file
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id/questions/:question_id/:file_name',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnSubmission('user_id', 'submission_id'),
    async (req, res) => {
      const { submission_id, question_id, file_name } = req.params
      const db = await getPool()
      const preResult = await db.query(
        `
          SELECT \`value\` from \`entry\` WHERE submission_id = ? AND question_id = ?
        `,
        [submission_id, question_id]
      )
      if (preResult.length < 1) {
        /*
        TODO: returning HTTP200 here is wrong. This is done since unit tests
        mocking db does not support mocking 3 sequencial SQL queries.

        We should add more SQL behaviour to config/endpoints.js and
        properly extend unit tests
        */

        res.status(200).json({ message: 'Entry not found' })
      } else {
        const resultArray = JSON.parse(preResult[0].value)

        let result = resultArray.find((file) => {
          return file.fileName === file_name
        })

        const uploadName = result.uploadName
        const fileName = result.fileName

        res.set('Content-disposition', 'attachment; filename=' + fileName)
        res.set('Content-Type', 'application/json')

        storage.downloadFile(uploadName).pipe(res)
      }
    }
  )

  // Update single submission, ie it is read!
  app.put(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { submission_id } = req.params
      const db = await getPool()
      const submission = req.body

      await db.query(
        `
        UPDATE \`submission\`
        SET
          \`read\` = ?
        WHERE
          \`id\` = ?
      `,
        [submission.read, submission_id]
      )

      res.json({ message: 'OK' })
    }
  )

  // view or preview a form
  app.get('/form/view/:id', async (req, res) => {
    const form_id = req.params.id
    const result = await formModel.get({ form_id })

    if (result === false) {
      return res.status(404).send('Form not found')
    }

    let form = result

    if (req.query.preview !== 'true' && form.published_version !== null) {
      const publishedResult = await formPublishedModel.get({
        form_id,
        version_id: form.published_version
      })

      if (publishedResult !== false) {
        form = publishedResult
      } else {
        console.error(
          `Published version can't be found form_id = ${form_id} version = ${form.published_version}`
        )
        error.errorReport(
          `Published version can't be found form_id = ${form_id} version = ${form.published_version}`
        )
      }
    }

    form.props = updateFormPropsWithNewlyAddedProps(form.props)

    const db = await getPool()
    const userRoleResult = await db.query(
      `
    SELECT \`role_id\` FROM \`user_role\` WHERE \`user_id\` = ?
    `,
      [form.user_id]
    )

    let showBranding = false

    if (userRoleResult[0].role_id === 2) {
      showBranding = true
    }

    const str = reactDOMServer.renderToStaticMarkup(
      React.createElement(Renderer, {
        className: 'form',
        form,
        mode: 'renderer'
      })
    )

    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/common.css')
    )
    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/themes/gleam.css')
    )
    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/modules/elements/index.css')
    )

    if (req.query.embed !== 'true') {
      style += ' body {background-color: #f5f5f5;} '
      style += ' .form {box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);} '
      style += ' .branding {box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16);}  '
    }

    //form table has "published_version" while form_published has "version"
    const postTarget =
      form.version === undefined
        ? `${BACKEND}/form/submit/${form_id}`
        : `${BACKEND}/form/submit/${form_id}/${form.version}`

    res.render('form.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      title: form.title,
      form: str,
      postTarget,
      BACKEND,
      showBranding,
      FORMID: form_id,
      USERID: form.user_id,
      RUNTIMEJSURL: `${BACKEND}/runtime/form.js`
    })
  })

  app.get('/templates/view/:id', async (req, res) => {
    const form_id = req.params.id

    if (form_id === 'undefined') {
      return res.status(404)
    }

    let rawTemplate = fs.readFileSync(
      path.resolve('../', `frontend/src/templates/forms/tpl-${form_id}.json`)
    )
    let form = JSON.parse(rawTemplate)

    const str = reactDOMServer.renderToStaticMarkup(
      React.createElement(Renderer, {
        className: 'form',
        form,
        mode: 'renderer'
      })
    )

    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )
    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/common.css')
    )
    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/themes/gleam.css')
    )
    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/modules/elements/index.css')
    )
    style += ' body {background-color: #f5f5f5;} '
    style += ' form {box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.16); margin: 35px;}'

    res.render('template.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      title: form.title,
      form: str,
      postTarget: `${BACKEND}/templates/submit/${form_id}`,
      BACKEND,
      FORMID: form_id
    })
  })

  app.get('/api/server/capabilities', async (req, res) => {
    const isEnvironmentVariableSet = {
      googleServiceAccountCredentials:
        process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS !== '',
      sendgridApiKey: process.env.SENDGRID_API_KEY !== '',
      googleCredentialsClientID:
        process.env.GOOGLE_CREDENTIALS_CLIENT_ID !== '',
      fileUploadBucket: process.env.FILE_UPLOAD_BUCKET !== ''
    }
    res.json(isEnvironmentVariableSet)
  })

  // uptime check
  app.get('/api/health', async (req, res) => {
    try {
      const db = await getPool()
      const result = await db.query(`SHOW TABLES`)

      if (result.length > 0) {
        res.status(200).json({ message: 'ok' })
      } else {
        res.status(500).json({ message: 'DB error' })
      }
    } catch (err) {
      console.error(err)
      error.errorReport(err)
      res.status(500).json({ message: 'DB error' })
    }
  })

  // a public endpoint to return datasets
  app.get('/api/datasets', async (req, res) => {
    const datasetName = req.query.dataset

    try {
      const datasetModule = require(path.resolve(
        'script',
        'transformed',
        'modules',
        'datasets',
        `${datasetName}.json`
      ))
      res.jsonp({
        datasetName,
        datasetModule
      })
    } catch (err) {
      console.error(err)
      res
        .status(500)
        .json({ message: 'Error while retrieving the dataset from server.' })
    }
  })

  // returns the forms of specified user in zip format
  app.get(
    '/api/users/:user_id/export/forms',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const user_id = req.params.user_id
      const formsArray = (await formModel.list({ user_id })) || []
      const archive = archiver('zip')

      archive.on('finish', function () {
        return res.end()
      })

      formsArray.forEach((form) => {
        archive.append(JSON.stringify(form), { name: `form_${form.id}.json` })
      })

      archive.pipe(res)
      await archive.finalize()
    }
  )
}
