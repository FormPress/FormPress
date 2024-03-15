const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

exports.get = async ({ user_id }) => {
  const db = await getPool()

  const result = await db.query(
    `
        SELECT
          u.*,
          ur.role_id AS role_id,
          r.name AS role_name,
          r.permission AS permission
        FROM \`user\` AS u
          JOIN \`user_role\` AS ur ON u.id = ur.user_id
          JOIN role AS r ON r.id = ur.\`role_id\`
        WHERE u.id = ? 
      `,
    [user_id]
  )

  if (result.length !== 0) {
    const user = result[0]

    let isAdmin = false

    const admin = await db.query(
      `SELECT \`email\` FROM \`admins\` WHERE email = ?`,
      [user.email]
    )

    if (admin.length > 0) {
      isAdmin = true
    }

    return {
      user_id: user.id,
      email: user.email,
      user_role: user.role_id,
      role_name: user.role_name,
      admin: isAdmin,
      permission: JSON.parse(user.permission)
    }
  } else {
    return false
  }
}

exports.setUserRoleWithName = async ({ user_id, role_name }) => {
  const db = await getPool()

  const roleIdResult = await db.query(`SELECT * FROM role WHERE name = ?`, [
    role_name
  ])

  if (roleIdResult.length < 1) {
    return false
  }

  const roleId = roleIdResult[0].id

  await db.query('UPDATE user_role SET role_id = ? WHERE user_id = ?', [
    roleId,
    user_id
  ])
}

exports.getAllRoles = async () => {
  const db = await getPool()
  const roleResult = await db.query('SELECT * FROM role')

  return roleResult
}
