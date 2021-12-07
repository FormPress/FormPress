const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

const hydrateForm = (form) => {
  form.props = JSON.parse(form.props)

  return form
}

exports.delete = async ({ form_id }) => {
  const db = await getPool()
  await db.query(
    `
    UPDATE \`form\` SET deleted_at = NOW() WHERE id = ? LIMIT 1
  `,
    [form_id]
  )
}

exports.get = async ({ form_id }) => {
  const db = await getPool()
  const result = await db.query(
    `
      SELECT * FROM \`form\` WHERE id = ? LIMIT 1
    `,
    [form_id]
  )

  if (result.length === 0) {
    return false
  }

  return hydrateForm(result[0])
}
