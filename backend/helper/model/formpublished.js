const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const { hydrateForm, dehydrateForm } = require('../formhydration')

class FormPublishedModel {
  constructor(user) {
    this.user = user

    // TODO: uncomment
    // this.shouldSanitize =
    //   user === undefined || (user && user.accessType === '3rdParty')

    // bind methods
    this.get = this.get.bind(this)
    this.create = this.create.bind(this)
  }

  async get({ form_id, version_id }) {
    const db = await getPool()
    let query = `
          SELECT *
          FROM \`form_published\`
          WHERE form_id = ?
          ORDER BY \`version\` DESC
          LIMIT 1
        `

    if (version_id !== undefined) {
      query = `
        SELECT * FROM \`form_published\`
        WHERE form_id = ? AND version = ?
      `
    }
    const result = await db.query(query, [form_id, version_id])

    if (result.length === 0) {
      return false
    }
    return hydrateForm(result[0])
  }

  async create({ user_id, form }) {
    const db = await getPool()
    dehydrateForm(form)
    const version = parseInt(form.published_version || 0)
    const nextVersion = version + 1

    await db.query(
      `
    INSERT INTO \`form_published\`
      (user_id, form_id, title, props, version, created_at)
    VALUES
      (?, ?, ?, ?, ?, NOW())
  `,
      [user_id, form.id, form.title, form.props, nextVersion]
    )

    await db.query(
      `
    UPDATE \`form\`
    SET published_version = ?
    WHERE id = ?
  `,
      [nextVersion, form.id]
    )
  }
}

module.exports = FormPublishedModel
