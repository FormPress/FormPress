const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

exports.storeAuthorizationCode = async ({
  code_id,
  authorization_code,
  client,
  user,
  redirectUri
}) => {
  const db = await getPool()

  try {
    const query =
      'INSERT INTO oauth_data (id, user_id, client_id, authorization_code, redirect_uri) VALUES (?, ?, ?, ?, ?)'
    const values = [
      code_id,
      user.user_id,
      client.id,
      authorization_code,
      redirectUri
    ]
    return await db.query(query, values)
  } catch (error) {
    console.log(error)
    return false
  }
}

exports.storeAccessToken = async ({ code_id, access_token }) => {
  const db = await getPool()

  try {
    const query =
      'UPDATE oauth_data SET access_token = ? WHERE id = ? AND access_token IS NULL'
    const values = [access_token, code_id]
    const result = await db.query(query, values)

    if (result.affectedRows === 0) {
      throw new Error(
        `Authorization code has already been used. Code ID: ${code_id}`
      )
    }

    return true
  } catch (error) {
    console.log(error)
    return false
  }
}
