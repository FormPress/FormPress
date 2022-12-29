const { v4 } = require('uuid')

module.exports = async (db) => {
  await db.query(`
        ALTER TABLE \`form\`
        ADD CONSTRAINT \`uuid\` UNIQUE KEY(uuid);
    `)

  const forms = await db.query(`
        SELECT * FROM \`form\` WHERE \`uuid\` IS NULL;
    `)

  forms.map((row) => {
    db.query(
      `UPDATE \`form\`
              SET \`uuid\` = ?
            WHERE
              id = ?
            `,
      [v4(), row.id]
    )
  })
}
