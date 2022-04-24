const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const { genRandomString, sha512 } = require(path.resolve('helper')).random
const { mustHaveValidToken } = require(path.resolve(
  'middleware',
  'authorization'
))

module.exports = (app) => {
  app.post('/api/users/changepassword/',
  mustHaveValidToken,
  async (req, res) => {
    const { user_id } = res.locals.auth
    const { current_password, new_password } = req.body
    const db = await getPool()

    const result = await db.query(
      `
      SELECT * FROM \`user\` WHERE id = ?
    `,
      [user_id]
    )
    if (result.length === 1) {
      if (
        result[0].password !==
        sha512(current_password, result[0].salt).passwordHash
      ) {
        res.status(403).json({ message: 'Current password is wrong.' })
      } else {
        let pattern = /^.{8,}$/
        if (!pattern.test(new_password)) {
          res.status(403).json({
            message: 'New password must contain at least 8 characters.'
          })
        } else {
          const hash = sha512(new_password, genRandomString(128))
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
    } else {
      res.status(403).json({ message: 'User not found' })
    }
  })
}
