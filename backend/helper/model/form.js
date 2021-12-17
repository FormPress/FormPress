const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const { hydrateForm, dehydrateForm } = require('../formhydration')

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

exports.create = async ({ user_id, form }) => {
  const db = await getPool()
  dehydrateForm(form)
  return await db.query(
    `
          INSERT INTO \`form\`
            (user_id, title, props, published_version, created_at, updated_at)
          VALUES
            (?, ?, ?, 0, NOW(), NOW())
        `,
    [user_id, form.title, form.props]
  )
}

exports.update = async ({ form }) => {
  const db = await getPool()
  dehydrateForm(form)
  await db.query(
    `
          UPDATE \`form\`
            SET props = ?, title = ?, updated_at = NOW()
          WHERE
            id = ?
        `,
    [form.props, form.title, form.id]
  )

  return await db.query(
    `
        SELECT \`updated_at\`
        FROM \`form\`
        WHERE id = ?
      `,
    [form.id]
  )
}

exports.list = async ({ user_id }) => {
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

  if (result.length === 0) {
    return false
  }
  return result.map(hydrateForm)
}
