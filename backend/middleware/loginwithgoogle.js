const path = require('path')
const https = require('https')
const jwt = require('jsonwebtoken')
const { genRandomString } = require(path.resolve('helper')).random
const { getPool } = require(path.resolve('./', 'db'))

const JWT_SECRET = process.env.JWT_SECRET

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
      ('${email}', NULL, NULL, '${verifyCode}', 1)
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

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    const jwt_data = {
      user_id: user.id,
      email: user.email,
      user_role: user.role_id,
      permission: JSON.parse(user.permission),
      exp
    }

    jwt.sign(jwt_data, JWT_SECRET, (err, token) => {
      console.log('token sign error ', err)

      res.status(200).json({
        message: 'Login Success',
        token,
        email: user.email,
        user_role: user.role_id,
        user_id: user.id,
        permission: JSON.parse(user.permission),
        exp
      })
    })
  })
}
