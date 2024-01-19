const path = require('path')
const https = require('https')
const { genRandomString } = require(path.resolve('helper')).random
const { getPool } = require(path.resolve('./', 'db'))
const { token } = require(path.resolve('helper')).token
const { locationFinder } = require(path.resolve('helper')).cfLocationFinder

async function checkWithGoogle(token) {
  const checkUrl = '/oauth2/v3/tokeninfo?id_token=' + token
  const options = {
    hostname: 'www.googleapis.com',
    port: 443,
    path: checkUrl,
    method: 'GET'
  }

  return new Promise((resolve, reject) => {
    https.get(options, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('error', reject)
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode <= 299) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          })
        } else {
          reject(
            'Request failed. status: ' + res.statusCode + ', body: ' + data
          )
        }
      })
    })
  })
}

module.exports = (app) => {
  app.post('/api/users/loginwithgoogle', async (req, res) => {
    const { email, tokenID } = req.body
    const googleResult = await checkWithGoogle(tokenID)

    const resultBody = JSON.parse(googleResult.body)
    const resultemail = resultBody.email
    const selectUserWithPermission = async (email) => {
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
          WHERE u.email = ?
        `,
        [email]
      )

      return result
    }

    if (email !== resultemail) {
      res.status(403).json({ message: 'Token does not match' })
    }
    const db = await getPool()
    let result = await selectUserWithPermission(email)

    if (result.length === 0) {
      const verifyCode = genRandomString(128)
      const newEntry = await db.query(`
        INSERT INTO \`user\`
          (email, password, salt, emailVerificationCode, emailVerified)
        VALUES
      ('${email}', '', '', '${verifyCode}', 1)
      `)

      //adding default role 2, it should be dynamic
      await db.query(`
        INSERT INTO \`user_role\`
          (user_id)
        VALUES
        ('${newEntry.insertId}')
      `)

      result = await selectUserWithPermission(email)
    }

    const user = result[0]

    if (user.isActive !== 1) {
      return res.status(403).json({
        message:
          'You have been blocked due to not following our TOS. If you think this is an error, contact our support team.'
      })
    }

    let isAdmin = false
    const admin = await db.query(
      `SELECT \`email\` FROM \`admins\` WHERE email = ?`,
      [user.email]
    )

    if (admin.length > 0) {
      isAdmin = true
    }

    const jwt_data = {
      user_id: user.id,
      email: user.email,
      user_role: user.role_id,
      role_name: user.role_name,
      admin: isAdmin,
      permission: JSON.parse(user.permission)
    }

    await locationFinder(
      user.id,
      req.get('cf-ipcountry'),
      req.cookies['fp_utm_source']
    )

    const data = await token(jwt_data)

    res.cookie('auth', data, {
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 3 * 24 * 60 * 60 * 1000,
      secure: true,
      sameSite: 'none',
      httpOnly: true
    })

    return res.status(200).json(jwt_data)
  })
}
