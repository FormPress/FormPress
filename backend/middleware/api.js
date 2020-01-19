const path = require('path')
const getPool = require(path.resolve('./', 'db'))
const reactDOMServer = require('react-dom/server')
const React = require('react')
const transform = require(path.resolve('script', 'babel-transform'))

module.exports = (app) => {
  const handleCreateForm = async (req, res) => {
    console.log('handleCreateForm Handler called')
    console.log('req.body', req.body, typeof req.body)
    const form = req.body
    const db = await getPool()

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
        [1, form.title, JSON.stringify(form.props)]
      )

      res.json({status: 'done', id: result.insertId})
    }
  }

  app.put('/api/users/:user_id/forms', handleCreateForm)
  app.post('/api/users/:user_id/forms', handleCreateForm)

  // return single form via id
  app.get('/api/users/:user_id/forms/:form_id', async (req, res) => {
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
  })

  // return single form via id
  app.delete('/api/users/:user_id/forms/:form_id', async (req, res) => {
    const { user_id, form_id } = req.params
    const db = await getPool()
    const result = await db.query(`
      UPDATE \`form\` SET deleted_at = NOW() WHERE id = ? LIMIT 1
    `, [form_id])
    
    res.json({message: 'deleted'})
  })

  // return forms of given user id
  app.get('/api/users/:user_id/forms', async (req, res) => {
    const user_id = req.params.user_id
    const db = await getPool()
    const result = await db.query(`
      SELECT * FROM \`form\` WHERE user_id = ? AND deleted_at IS NULL
    `, [user_id])

    if (result.length > 0) {
      res.json(result)
    } else {
      res.json([])
    }
  })

  // return submissions of given form id
  app.get('/api/users/:user_id/forms/:form_id/submissions', async (req, res) => {
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
  })

  // return entries of given submission id
  app.get(
    '/api/users/:user_id/forms/:form_id/submissions/:submission_id/entries',
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

    console.log('Form found ', result)
    const form = result[0]
    form.props = JSON.parse(form.props)

    // Update frontend form renderer TODO: don't do this on production!
    transform()
    const Renderer = require(path.resolve('script', 'transformed', 'Renderer')).default

    const str = reactDOMServer.renderToStaticMarkup(
      React.createElement(
        Renderer,
        { form }
      )
    )

    res.render(
      'form.tpl.ejs',
      {
        title: form.title,
        form: str,
        postTarget: `http://localhost:${port}/form/submit/${form.id}`
      }
    )
  })
}