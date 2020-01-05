const express = require('express')
const path = require('path')
const app = express()
const port = parseInt(process.env.SERVER_PORT || 3000)
const getPool = require(path.resolve('./', 'db'))

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

  next()
})
app.use(express.json())

app.get('/', (req, res) => res.send('Hello World!'))

const handlePostForm = async (req, res) => {
  console.log('HandlePostForm Handler called')
  console.log('req.body', req.body, typeof req.body)
  const form = req.body
  const db = await getPool()

  if (typeof form.id !== 'undefined') {
    // Existing form should update!!!
    await db.query(
      `
        UPDATE \`form\`
          SET props = ?
        WHERE
          id = ?
      `,
      [JSON.stringify(form), form.id]
    )

    res.json({status: 'updated', id: form.id})
  } else {
    // New Form
    const result = await db.query(
      `
        INSERT INTO \`form\`
          (user_id, title, props)
        VALUES
          (?, ?, ?)
      `,
      [1, 'My First Form', JSON.stringify(form)]
    )

    res.json({status: 'done', id: result.insertId})
  }
}

app.post('/form', handlePostForm)

app.get('/form/:id', async (req, res) => {
  const id = req.params.id
  const db = await getPool()
  const result = await db.query(`
    SELECT * FROM \`form\` WHERE id = ? LIMIT 1
  `, [id])
  
  if (result.length === 1) {
    res.json(result[0])
  } else {
    res.json({})
  }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
