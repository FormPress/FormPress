const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const { genRandomString, sha512 } = require(path.resolve('helper')).random

module.exports = (app) => {
  app.post(
    '/api/users/:user_id/resetpassword/:password_reset_code',
    async (req, res) => {
      const { user_id, password_reset_code } = req.params
      const { password } = req.body
      const db = await getPool()

      const result = await db.query(
        `
      SELECT \`passwordResetCode\`, \`passwordResetCodeExpireAt\` FROM \`user\` WHERE id = ?
    `,
        [user_id]
      )
      if (result.length === 1) {
        if (result[0].passwordResetCode !== password_reset_code) {
          res.status(403).json({ message: 'Your URL seems wrong' })
        } else {
          let pattern = /^.{8,}$/
          if (!pattern.test(password)) {
            res.status(403).json({
              message: 'New password must contain at least 8 characters.'
            })
          }else{
            const expireDate = new Date(
              Date.parse(result[0].passwordResetCodeExpireAt)
            )
            const currentDate = new Date(Date.now())

            if (currentDate > expireDate) {
              res.status(403).json({ message: 'Reset Link Expired' })
            } else {
              const hash = sha512(password, genRandomString(128))
              await db.query(
                `
            UPDATE \`user\`
            SET \`password\` = ?, \`salt\` = ?, \`emailVerified\` = 1
            WHERE id = ?
          `,
                [hash.passwordHash, hash.salt, user_id]
              )
              res.status(200).json({ message: 'Password changed succesfully' })
            }
          }
        }
      } else {
        res.status(403).json({ message: 'User not found' })
      }
    }
  )
}
