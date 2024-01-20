const path = require('path')

const { sha512 } = require(path.resolve('helper')).random
const { token } = require(path.resolve('helper')).token
const { getPool } = require(path.resolve('./', 'db'))
const { locationFinder } = require(path.resolve('helper')).cfLocationFinder

module.exports = (app) => {
  app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body
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
        WHERE u.email = ?
      `,
      [email]
    )

    if (result.length === 0) {
      return res.status(403).json({ message: 'Email/Password is not correct' })
    } else {
      const user = result[0]
      const incomingHash = sha512(password, user.salt)

      if (user.password === incomingHash.passwordHash) {
        if (user.isActive !== 1) {
          return res.status(403).json({
            message:
              'You have been blocked due to not following our TOS. If you think this is an error, contact our support team.'
          })
        } else if (user.emailVerified === 0) {
          return res.status(403).json({ message: 'Email not verified' })
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
      } else {
        console.log('PWD FALSE')
        return res
          .status(403)
          .json({ message: 'Email/Password is not correct' })
      }
    }
  })

  // logout route
}
