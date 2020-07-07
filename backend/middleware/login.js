const crypto = require('crypto')
const path = require('path')
const jwt = require('jsonwebtoken')

const { genRandomString, sha512 } = require(path.resolve('helper')).random

const { getPool } = require(path.resolve('./', 'db'))

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body
    const db = await getPool()

    const result = await db.query(
      `
        SELECT *
        FROM \`user\`
        WHERE email = ?
      `,
      [email]
    )

    if (result.length === 0) {
      const salt = genRandomString(128)
      const hash = sha512(password, salt)
      console.log(`DEBUG INSERT: ${email} `, hash, salt)

      return res.status(403).json({ message: 'Email/Password does not match' })
    } else {
      const user = result[0]
      const incomingHash = sha512(password, user.salt)

      if (user.password === incomingHash.passwordHash) {
        const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 *7)
        const jwt_data = {
          user_id: user.id,
          email: user.email,
          name: user.name,
          exp
        }

        jwt.sign(jwt_data, JWT_SECRET, (err, token) => {
          console.log('token sign error ', err)
          console.log('SIGNED TOKEN ', {
            message: 'Login Success',
            token,
            user_id: user.id,
            name: user.name,
            exp
          })
          res.status(200).json({
            message: 'Login Success',
            token,
            user_id: user.id,
            name: user.name,
            exp
          })
        })
        
      } else {
        console.log('PWD FALSE')
        res.status(403).json({ message: 'Email/Password does not match' })
      }
    }
  })
}

