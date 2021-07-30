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
    const { tokenID } = req.body
    const googleResult = await checkWithGoogle(tokenID)

    const resultBody = JSON.parse(googleResult.body)
    const email = resultBody.email

    const db = await getPool()
    const result = await db.query(
      `
        SELECT *
        FROM \`user\`
        WHERE email = ? AND emailVerified = 1
      `,
      [email]
    )
    let userId = ''
    if (result.length === 0) {
      const verifyCode = genRandomString(128)
      const newEntry = await db.query(`
        INSERT INTO \`user\`
          (email, password, salt, emailVerificationCode, emailVerified)
        VALUES
      ('${email}', NULL, NULL, '${verifyCode}', 1)
      `)
      userId = newEntry.insertId
    } else {
      userId = result[0].id
    }

    const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
    const jwt_data = {
      user_id: userId,
      email: email,
      exp
    }

    jwt.sign(jwt_data, JWT_SECRET, (err, token) => {
      console.log('token sign error ', err)
      console.log('SIGNED TOKEN ', {
        message: 'Login Success',
        token,
        user_id: userId,
        exp
      })
      res.status(200).json({
        message: 'Login Success',
        email: email,
        token,
        user_id: userId,
        exp
      })
    })
  })
}
