const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

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
        res.status(200).json({ message: 'E-mail verified' })
      }
    } else {
      const result = await db.query(
        `
        SELECT \`emailVerificationCode\` FROM \`user\` WHERE id = ? AND emailVerified = 1
      `,
        [user_id]
      )
      if (result.length === 1) {
        res.status(403).json({ message: 'Email already verified.' })
      } else {
        res.status(403).json({ message: 'User not found.' })
      }
    }
  })
}
