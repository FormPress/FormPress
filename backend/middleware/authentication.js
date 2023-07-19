const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.use((req, res, next) => {
    const { auth } = req.cookies

    if (auth) {
      jwt.verify(auth, JWT_SECRET+'asd', (err, decoded) => {
        if (err !== null) {
          res.clearCookie('auth', { domain: process.env.COOKIE_DOMAIN, path: '/' })
          return next()
        }

        req.user = decoded
        res.locals.validToken = true

        next()
      })
    } else {
      next()
    }
  })
}
