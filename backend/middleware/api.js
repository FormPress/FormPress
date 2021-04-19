const path = require('path')
const fs = require('fs')

const { getPool } = require(path.resolve('./', 'db'))
const {
  mustHaveValidToken,
  paramShouldMatchTokenUserId,
  userShouldOwnSubmission
} = require(path.resolve('middleware', 'authorization'))
const reactDOMServer = require('react-dom/server')
const React = require('react')
const transform = require(path.resolve('script', 'babel-transform'))
const port = parseInt(process.env.SERVER_PORT || 3000)
const { Storage } = require('@google-cloud/storage')

module.exports = (app) => {
  const handleCreateForm = async (req, res) => {
    const form = req.body
    const db = await getPool()
    const { user_id } = req.params

    if (typeof form.id !== 'undefined' && form.id !== null) {
      // Existing form should update!!!
      await db.query(
        `
          UPDATE \`form\`
            SET props = ?, title = ?, updated_at = NOW()
          WHERE
            id = ?
        `,
        [JSON.stringify(form.props), form.title, form.id]
      )

      const result = await db.query(
        `
        SELECT \`updated_at\`
        FROM \`form\`
        WHERE id = ?
      `,
        [form.id]
      )

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
      const result = await db.query(
        `
          INSERT INTO \`form\`
            (user_id, title, props, published_version, created_at, updated_at)
          VALUES
            (?, ?, ?, 0, NOW(), NOW())
        `,
        [user_id, form.title, JSON.stringify(form.props)]
      )

      res.json({ status: 'done', id: result.insertId })
    }
  }

  app.put(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    handleCreateForm
  )
  app.post(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    handleCreateForm
  )

  // return forms of given user id
  app.get(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const user_id = req.params.user_id
      const db = await getPool()
      const result = await db.query(
        `
        SELECT
          id,
          user_id,
          title,
          props,
          published_version,
          created_at,
          (
            SELECT
                COUNT(*)
            FROM
                submission
            WHERE
                form_id = \`form\`.\`id\`
          ) as responseCount
        FROM \`form\`
        WHERE
          user_id = ? AND 
          deleted_at IS NULL
      `,
        [user_id]
      )

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  // return single form via id
  app.get(
    '/api/users/:user_id/forms/:form_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { form_id } = req.params
      const db = await getPool()

      let query = `SELECT * FROM \`form\` WHERE id = ? LIMIT 1`

      if (req.query.published === 'true') {
        query = `
          SELECT *
          FROM \`form_published\`
          WHERE form_id = ?
          ORDER BY \`version\` DESC
          LIMIT 1
        `
      }

      const result = await db.query(query, [form_id])

      if (result.length === 1) {
        res.json(result[0])
      } else {
        res.json({})
      }
    }
  )

  // return form questions
  app.get('/api/users/:user_id/forms/:form_id/elements', async (req, res) => {
    const { form_id } = req.params
    const db = await getPool()
    const result = await db.query(
      `
        SELECT * FROM \`form\` WHERE id = ? LIMIT 1
      `,
      [form_id]
    )

    if (result.length === 1) {
      const form = result[0]

      res.json(JSON.parse(form.props).elements)
    } else {
      res.json({})
    }
  })

  // publish form, takes latest form and publishes it
  app.post(
    '/api/users/:user_id/forms/:form_id/publish',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id, form_id } = req.params
      const db = await getPool()
      const result = await db.query(
        `
        SELECT * FROM \`form\` WHERE id = ? LIMIT 1
      `,
        [form_id]
      )

      if (result.length === 1) {
        const form = result[0]
        const version = parseInt(form.published_version || 0)
        const nextVersion = version + 1

        const insertPublishedResult = await db.query(
          `
          INSERT INTO \`form_published\`
            (user_id, form_id, title, props, version, created_at)
          VALUES
            (?, ?, ?, ?, ?, NOW())
        `,
          [user_id, form_id, form.title, form.props, nextVersion]
        )

        const publishedResult = await db.query(
          `
          SELECT \`created_at\`
          FROM \`form_published\`
          WHERE \`id\` = ?
        `,
          [insertPublishedResult.insertId]
        )

        await db.query(
          `
          UPDATE \`form\`
          SET published_version = ?, updated_at = ?
          WHERE id = ?
        `,
          [nextVersion, publishedResult[0].created_at, form_id]
        )
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
      const db = await getPool()
      await db.query(
        `
        UPDATE \`form\` SET deleted_at = NOW() WHERE id = ? LIMIT 1
      `,
        [form_id]
      )

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
      const formResult = await db.query(
        `
        SELECT * FROM \`form\`
          WHERE id = ?
      `,
        [form_id]
      )

      /*
        TODO: returning HTTP200 here is wrong. This is done since unit tests
        mocking db does not support mocking 3 sequencial SQL queries.

        We should add more SQL behaviour to config/endpoints.js and
        properly extend unit tests
      */
      if (formResult.length === 0) {
        //form not found
        return res.status(200).json({ message: 'Form not found' })
      }

      formResult[0].props = JSON.parse(formResult[0].props)

      const form = formResult[0]
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
    '/api/users/:user_id/forms/:form_id/submissons/:submission_id/questions/:question_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    userShouldOwnSubmission('user_id', 'submission_id'),
    async (req, res) => {
      const storage = new Storage({
        keyFilename: process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE,
        projectId: 'formpress'
      })
      const fileDownloadBucket = storage.bucket(process.env.FILE_UPLOAD_BUCKET)
      const { submission_id, question_id } = req.params
      const db = await getPool()
      const preResult = await db.query(
        `
          SELECT \`value\` from \`entry\` WHERE submission_id = ? AND question_id = ?
        `,
        [submission_id, question_id]
      )
      if (preResult.length < 1) {
        res.status(404).send('Can not find file')
      } else {
        const result = JSON.parse(preResult[0].value)
        const uploadName = result.uploadName
        const fileName = result.fileName
        const fileToDownload = fileDownloadBucket.file(uploadName)

        res.set('Content-disposition', 'attachment; filename=' + fileName)
        res.set('Content-Type', 'text/plain')
        fileToDownload
          .createReadStream()
          .on('error', function (err) {
            console.log(err)
            res.status(404).send('Are you sure about your url?')
          })
          .pipe(res)
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

  app.get('/form/view/:id', async (req, res) => {
    const id = req.params.id
    const db = await getPool()
    const result = await db.query(
      `
      SELECT * FROM \`form\` WHERE id = ? LIMIT 1
    `,
      [id]
    )

    if (result.length === 0) {
      return res.status(404).send('Form not found')
    }

    let form = result[0]

    if (req.query.preview !== 'true' && form.published_version !== null) {
      const publishedResult = await db.query(
        `
        SELECT * FROM \`form_published\`
        WHERE form_id = ? AND version = ?
      `,
        [id, form.published_version]
      )

      if (publishedResult.length > 0) {
        form = publishedResult[0]
      } else {
        console.error(
          `Published version can't be found form_id = ${id} version = ${form.published_version}`
        )
      }
    }

    form.props = JSON.parse(form.props)

    // Update frontend form renderer TODO: don't do this on production!
    transform()
    const Renderer = require(path.resolve('script', 'transformed', 'Renderer'))
      .default

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
      path.resolve('../', 'frontend/src/modules/elements/index.css')
    )

    const { FP_ENV, FP_HOST } = process.env
    const BACKEND = FP_ENV === 'development' ? `${FP_HOST}:${port}` : FP_HOST
    //form table has "published_version" vs form_published has "version"
    const postTarget =
      form.version === undefined
        ? `${BACKEND}/form/submit/${id}`
        : `${BACKEND}/form/submit/${id}/${form.version}`

    res.render('form.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      title: form.title,
      form: str,
      postTarget,
      BACKEND,
      FORMID: id,
      USERID: form.user_id,
      RUNTIMEJSURL: `${BACKEND}/runtime/form.js`
    })
  })
}
