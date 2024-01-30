const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.use((req, res, next) => {
    const bearerAuth = req.get('Authorization')?.split(' ')[1]
    const cookieAuth = req.cookies.auth

    const auth = bearerAuth || cookieAuth

    if (auth) {
      jwt.verify(auth, JWT_SECRET, (err, decoded) => {
        if (err !== null) {
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
