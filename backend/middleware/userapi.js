const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

const { mustHaveValidToken } = require(path.resolve(
  'middleware',
  'authorization'
))

const signUp = require(path.resolve('middleware', 'signup'))
const login = require(path.resolve('middleware', 'login'))
const loginWithGoogle = require(path.resolve('middleware', 'loginwithgoogle'))

module.exports = (app) => {
  // Sign up
  signUp(app)

  // Default sign in method
  login(app)

  // Sign in & Log in with Google
  loginWithGoogle(app)

  // Get user info
  app.get('/api/users/me', mustHaveValidToken, async (req, res) => {
    const db = await getPool()

    const { user_id } = req.user

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
        WHERE u.id = ? 
      `,
      [user_id]
    )

    if (result.length !== 0) {
      const user = result[0]

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

      res.json({ status: 'done', auth: jwt_data })
    } else {
      res.json({ status: 'error' })
    }
  })

  // Log out
  app.post('/api/users/logout', async (req, res) => {
    res.clearCookie('auth', { domain: process.env.COOKIE_DOMAIN, path: '/' })

    return res.status(200).json({ message: 'Logged out' })
  })
}
