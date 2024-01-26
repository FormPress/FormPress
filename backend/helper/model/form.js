const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const { hydrateForm, dehydrateForm } = require('../formhydration')
const { v4 } = require('uuid')

class FormModel {
  constructor(user) {
    this.user = user

    this.shouldSanitizeSensitiveData = false

    if (user && user.accessType === '3rdParty') {
      this.shouldSanitizeSensitiveData = true
    }

    // bind methods
    this.delete = this.delete.bind(this)
    this.get = this.get.bind(this)
    this.create = this.create.bind(this)
    this.update = this.update.bind(this)
    this.list = this.list.bind(this)
    this.getFormIdFromUUID = this.getFormIdFromUUID.bind(this)
    this.getFormsAndPermsSharedWithUser = this.getFormsAndPermsSharedWithUser.bind(
      this
    )
  }

  async delete({ form_id }) {
    const db = await getPool()
    await db.query(
      `
    UPDATE \`form\` SET deleted_at = NOW() WHERE id = ? LIMIT 1
  `,
      [form_id]
    )
  }

  async get({ form_id }) {
    const db = await getPool()
    const result = await db.query(
      `
      SELECT * FROM \`form\` WHERE id = ? AND deleted_at IS NULL LIMIT 1
    `,
      [form_id]
    )

    if (result.length === 0) {
      return false
    }

    return hydrateForm(result[0], this.shouldSanitizeSensitiveData)
  }

  async create({ user_id, form }) {
    const db = await getPool()
    dehydrateForm(form)
    const uuid = v4()
    const result = await db.query(
      `
          INSERT INTO \`form\`
            (uuid, user_id, title, props, private, published_version, created_at)
          VALUES
            (?, ?, ?, ?, ?, 0, NOW())
        `,
      [uuid, user_id, form.title, form.props, form.private]
    )

    result.uuid = uuid

    return result
  }

  async update({ form }) {
    const db = await getPool()
    dehydrateForm(form)
    await db.query(
      `
          UPDATE \`form\`
            SET props = ?, title = ?, private = ? 
          WHERE
            id = ?
        `,
      [form.props, form.title, form.private, form.id]
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

  async list({ user_id }) {
    const db = await getPool()
    const result = await db.query(
      `
        SELECT
          id,
          uuid,
          user_id,
          title,
          props,
          private,
          published_version,
          created_at,
          (
            SELECT
                COUNT(*)
            FROM
                submission
            WHERE
                form_id = \`form\`.\`id\`
          ) as responseCount,
          (
            SELECT
                COUNT(*)
            FROM
                submission
            WHERE
                form_id = \`form\`.\`id\`
            AND
                  \`read\` = 0
          ) as unreadCount
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
    return result.map((row) =>
      hydrateForm(row, this.shouldSanitizeSensitiveData)
    )
  }

  async getFormIdFromUUID(uuid) {
    const db = await getPool()
    const result = await db.query(
      `
      SELECT * FROM \`form\` WHERE uuid = ? AND deleted_at IS NULL LIMIT 1
    `,
      [uuid]
    )

    if (result.length === 0) {
      return false
    }

    return result[0].id
  }

  /*
  Return list of formIds that is shared with user_id and with specific permissions
  returns the ids if any of the permissions match
*/
  async getFormsAndPermsSharedWithUser(user_id, permissions) {
    const db = await getPool()
    const result = await db.query(
      `SELECT * FROM \`form_permission\` WHERE target_user_id = ?`,
      [user_id]
    )

    let ret = []
    let formsAndPerms = []
    for (const row of result) {
      const db_permissions = JSON.parse(row.permissions)
      let match = false

      for (const key of Object.keys(db_permissions)) {
        if (permissions[key] === db_permissions[key]) {
          match = true
          break
        }
      }

      if (match === true) {
        formsAndPerms.push({
          form_id: row.form_id,
          permissions: db_permissions
        })
      }
    }

    //filter out deleted forms
    if (formsAndPerms.length > 0) {
      const unDeletedForms = await db.query(
        `
      SELECT id FROM \`form\` WHERE id IN(${formsAndPerms
        .map((form) => form.form_id)
        .join(',')})
        AND deleted_at IS NULL
    `,
        [...formsAndPerms]
      )

      const finalForms = unDeletedForms.map((row) => row.id)
      ret = formsAndPerms.filter((form) => finalForms.includes(form.form_id))
    }

    return ret
  }
}

module.exports = FormModel
