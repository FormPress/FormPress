const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.use((req, res, next) => {
    const { auth } = req.cookies

    if (auth) {
      jwt.verify(auth, JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          return next()
        }

        req.cookies.auth = decoded
        res.locals.validToken = true

        next()
      })
    } else {
      next()
    }
  })
}
