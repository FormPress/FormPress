const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

const { token } = require(path.resolve('helper')).token

const { model } = require(path.resolve('helper'))
const userModel = model.user
const FRONTEND = process.env.FE_FRONTEND

module.exports = (app) => {
  app.get('/api/users/:user_id/verify/:verification_code', async (req, res) => {
    const { user_id, verification_code } = req.params
    const db = await getPool()

    const result = await db.query(
      `
      SELECT \`emailVerificationCode\` FROM \`user\` WHERE id = ? AND emailVerified = 0
    `,
      [user_id]
    )
    if (result.length === 1) {
      const dbVerificationCode = result[0].emailVerificationCode
      if (dbVerificationCode === verification_code) {
        await db.query(
          `
            UPDATE \`user\` SET \`emailVerified\` = 1 WHERE id = ?
          `,
          [user_id]
        )

        const user = await userModel.get({ user_id })
        const data = await token(user)

        res.cookie('auth', data, {
          domain: process.env.COOKIE_DOMAIN,
          maxAge: 3 * 24 * 60 * 60 * 1000,
          secure: true,
          sameSite: 'none',
          httpOnly: true
        })

        return res.status(200).json({ message: 'E-mail verified' })
      } else {
        return res.status(403).json({ message: 'Invalid verification code.' })
      }
    } else {
      const result = await db.query(
        `
        SELECT \`emailVerificationCode\` FROM \`user\` WHERE id = ? AND emailVerified = 1
      `,
        [user_id]
      )
      if (result.length === 1) {
        return res.status(403).json({ message: 'Email already verified.' })
      } else {
        return res.status(403).json({ message: 'User not found.' })
      }
    }
  })
}
