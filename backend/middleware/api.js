const path = require('path')
const fs = require('fs')

const { getPool } = require(path.resolve('./', 'db'))
const {
  mustHaveValidToken,
  paramShouldMatchTokenUserId
} = require(path.resolve('middleware', 'authorization'))
const reactDOMServer = require('react-dom/server')
const React = require('react')
const transform = require(path.resolve('script', 'babel-transform'))
const port = parseInt(process.env.SERVER_PORT || 3000)

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

      res.json({status: 'updated', id: form.id})
    } else {
      // New Form
      const result = await db.query(
        `
          INSERT INTO \`form\`
            (user_id, title, props, created_at, updated_at)
          VALUES
            (?, ?, ?, NOW(), NOW())
        `,
        [user_id, form.title, JSON.stringify(form.props)]
      )

      res.json({status: 'done', id: result.insertId})
    }
  }

  app.put(
    '/api/users/:user_id/forms',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    handleCreateForm
  )
  app.post('/api/users/:user_id/forms',
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
      const result = await db.query(`
        SELECT
          id,
          user_id,
          title,
          props,
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
      `, [user_id])

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  // return single form via id
  app.get('/api/users/:user_id/forms/:form_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id, form_id } = req.params
      const db = await getPool()
      const result = await db.query(`
        SELECT * FROM \`form\` WHERE id = ? LIMIT 1
      `, [form_id])
      
      if (result.length === 1) {
        res.json(result[0])
      } else {
        res.json({})
      }
    }
  )

  // return form questions
  app.get('/api/users/:user_id/forms/:form_id/elements',
    async (req, res) => {
      const { user_id, form_id } = req.params
      const db = await getPool()
      const result = await db.query(`
        SELECT * FROM \`form\` WHERE id = ? LIMIT 1
      `, [form_id])

      if (result.length === 1) {
        const form = result[0]

        res.json(JSON.parse(form.props).elements)
      } else {
        res.json({})
      }
    }
  )

  // delete single form via id
  app.delete(
    '/api/users/:user_id/forms/:form_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id, form_id } = req.params
      const db = await getPool()
      const result = await db.query(`
        UPDATE \`form\` SET deleted_at = NOW() WHERE id = ? LIMIT 1
      `, [form_id])
      
      res.json({message: 'deleted'})
    }
  )

  // return submissions of given form id
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id, form_id } = req.params
      const db = await getPool()
      const result = await db.query(`
        SELECT * FROM \`submission\` WHERE form_id = ?
      `, [form_id])

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

      const result = await db.query(`
        SELECT * FROM \`entry\`
          WHERE form_id = ? AND submission_id IN (${ids.map(() => '?').join(',')})
      `, [form_id, ...ids])
      const submissionsResult = await db.query(`
        SELECT * FROM \`submission\`
          WHERE form_id = ? AND id IN (${ids.map(() => '?').join(',')})
      `, [form_id, ...ids])
      const formResult = await db.query(`
        SELECT * FROM \`form\`
          WHERE id = ?
      `, [form_id])

      formResult[0].props = JSON.parse(formResult[0].props)

      const form = formResult[0]
      const CSVData = {}
      const submissions = {}

      for (const submission of submissionsResult) {
        submissions[submission.id] = submission
      }

      for (const entry of result) {
        const questionId = entry.question_id
        const questionProps = form.props.elements.filter((element) => (element.id === questionId))
        const label = questionProps.label
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

      const createCsvStringifier = require('csv-writer').createObjectCsvStringifier
      const header = [
        {id: 'submissionId', title: 'ID'},
        {id: 'createdAt', title: 'CREATED_AT'}
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
      const csv = csvStringifier.getHeaderString() +
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
      const { user_id, form_id, submission_id} = req.params
      const db = await getPool()
      const result = await db.query(`
        SELECT * FROM \`entry\` WHERE submission_id = ?
      `, [submission_id])

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  // Update single submission, ie it is read!
  app.put(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const { user_id, form_id, submission_id} = req.params
      const db = await getPool()
      const submission = req.body

      const result = await db.query(`
        UPDATE \`submission\`
        SET
          \`read\` = ?
        WHERE
          \`id\` = ?
      `, [submission.read, submission_id])

      res.json({message: 'OK'})
    }
  )

  app.get('/form/view/:id', async (req, res) => {
    const id = req.params.id
    const db = await getPool()
    const result = await db.query(`
      SELECT * FROM \`form\` WHERE id = ? LIMIT 1
    `, [id])

    if (result.length === 0) {
      return res.status(404).send('Form not found')
    }

    const form = result[0]
    form.props = JSON.parse(form.props)

    // Update frontend form renderer TODO: don't do this on production!
    transform()
    const Renderer = require(path.resolve('script', 'transformed', 'Renderer')).default

    const str = reactDOMServer.renderToStaticMarkup(
      React.createElement(
        Renderer,
        { className: 'form', form, mode: 'renderer' }
      )
    )
    let style = fs.readFileSync(path.resolve('../', 'frontend/src/style/normalize.css'))
    
    style += fs.readFileSync(path.resolve('../', 'frontend/src/style/common.css'))
    style += fs.readFileSync(path.resolve('../', 'frontend/src/modules/elements/index.css'))

    const { FP_ENV, FP_HOST } = process.env
    const BACKEND = (FP_ENV === 'development')
      ? `${FP_HOST}:${port}`
      : FP_HOST
    const postTarget = `${BACKEND}/form/submit/${form.id}`

    res.render(
      'form.tpl.ejs',
      {
        headerAppend: `<style type='text/css'>${style}</style>`,
        title: form.title,
        form: str,
        postTarget,
        BACKEND,
        FORMID: id,
        USERID: form.user_id,
        RUNTIMEJSURL: `${BACKEND}/runtime/form.js`
      }
    )
  })
}
