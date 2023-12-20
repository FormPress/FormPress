const path = require('path')
const { token } = require(path.resolve('helper')).token

const { mustHaveValidToken } = require(path.resolve(
  'middleware',
  'authorization'
))

const signUp = require(path.resolve('middleware', 'signup'))
const login = require(path.resolve('middleware', 'login'))
const loginWithGoogle = require(path.resolve('middleware', 'loginwithgoogle'))
const { model } = require(path.resolve('helper'))
const userModel = model.user

const demoAuthentication = async (req, res) => {
  const demoUser = {
    user_id: 0,
    email: 'demo@formpress.org',
    user_role: 2,
    role_name: 'Default Free',
    admin: false,
    permission: {
      formLimit: '5',
      submissionLimit: '100',
      uploadLimit: '120',
      Button: true,
      Checkbox: true,
      TextBox: true,
      TextArea: true,
      Dropdown: true,
      Radio: true,
      Name: true,
      Email: true,
      Header: true,
      FileUpload: true,
      Separator: true,
      PageBreak: true,
      Address: true,
      NetPromoterScore: true,
      Phone: true,
      Image: true,
      RatingScale: true,
      DatePicker: true
    }
  }

  const data = await token(demoUser)

  // renew auth cookie
  res.cookie('auth', data, {
    domain: process.env.COOKIE_DOMAIN,
    maxAge: 3 * 24 * 60 * 60 * 1000,
    secure: true,
    sameSite: 'none',
    httpOnly: true
  })

  res.json({ status: 'done', auth: demoUser })
}

module.exports = (app) => {
  // Sign up
  signUp(app)

  // Default sign in method
  login(app)

  // Sign in & Log in with Google
  loginWithGoogle(app)

  // Return user info
  app.get(
    '/api/users/me',
    async (req, res, next) => {
      mustHaveValidToken(req, res, next, demoAuthentication)
    },
    async (req, res) => {
      const { user_id } = req.user

      if (user_id === 0) {
        return demoAuthentication(req, res)
      }

      const user = await userModel.get({ user_id })

      if (user === false) {
        return res.json({ status: 'error' })
      }

      const { renewCookie } = req.query

      if (renewCookie) {
        const data = await token(user)

        res.cookie('auth', data, {
          domain: process.env.COOKIE_DOMAIN,
          maxAge: 3 * 24 * 60 * 60 * 1000,
          secure: true,
          sameSite: 'none',
          httpOnly: true
        })
      }

      return res.json({ status: 'done', auth: user })
    }
  )

  // Log out
  app.post('/api/users/logout', async (req, res) => {
    res.clearCookie('auth', { domain: process.env.COOKIE_DOMAIN, path: '/' })

    return res.status(200).json({ message: 'Logged out' })
  })
}
