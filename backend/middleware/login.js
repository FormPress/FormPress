const path = require('path')
const jwt = require('jsonwebtoken')

const { genRandomString, sha512 } = require(path.resolve('helper')).random
const { error } = require(path.resolve('helper'))

const { getPool } = require(path.resolve('./', 'db'))

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body
    const db = await getPool()

    const result = await db.query(
      `
        SELECT
          u.*,
          ur.role_id AS role_id,
          r.permission AS permission
        FROM \`user\` AS u
          JOIN \`user_role\` AS ur ON u.id = ur.user_id
          JOIN role AS r ON r.id = ur.\`role_id\`
        WHERE u.email = ? AND u.emailVerified = 1
      `,
      [email]
    )

    if (result.length === 0) {
      const salt = genRandomString(128)
      const hash = sha512(password, salt)
      console.log(`DEBUG INSERT: ${email} `, hash, salt)

      return res.status(403).json({ message: 'Email not verified' })
    } else {
      const user = result[0]
      const incomingHash = sha512(password, user.salt)

      if (user.password === incomingHash.passwordHash) {
        if (user.isActive !== 1) {
          res
            .status(403)
            .json({
              message:
                'You have been blocked because of not following our TOS. If you think this is an error contact our support team.'
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

        const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
        const jwt_data = {
          user_id: user.id,
          email: user.email,
          user_role: user.role_id,
          admin: isAdmin,
          permission: JSON.parse(user.permission),
          exp
        }

        jwt.sign(jwt_data, JWT_SECRET, (err, token) => {
          console.log('token sign error ', err)
          error.errorReport(err)

          res.status(200).json({
            message: 'Login Success',
            token,
            user_role: user.role_id,
            admin: isAdmin,
            user_id: user.id,
            permission: JSON.parse(user.permission),
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
