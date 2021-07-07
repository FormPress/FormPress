module.exports = async (db) => {
  const unpublished_form_rows = await db.query(`
    SELECT * FROM \`form\`
  `)

  const published_form_rows = await db.query(`
    SELECT * FROM \`form_published\`
  `)

  unpublished_form_rows.map((row) => {
    let rowProps = JSON.parse(row.props)
    rowProps.elements.forEach(function (element) {
      if (element.type === 'Text') {
        element.type = 'TextBox'
      }
      db.query(
        `UPDATE \`form\`
          SET props = ?
        WHERE
          id = ?
      `,
        [JSON.stringify(rowProps), row.id]
      )
    })
  })

  published_form_rows.map((row) => {
    let rowProps = JSON.parse(row.props)
    rowProps.elements.forEach(function (element) {
      if (element.type === 'Text') {
        element.type = 'TextBox'
      }
      db.query(
        `UPDATE \`form_published\`
          SET props = ?
        WHERE
          id = ?
      `,
        [JSON.stringify(rowProps), row.id]
      )
    })
  })
}
