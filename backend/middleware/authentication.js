const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.use((req, res, next) => {
    const auth = req.get('Authorization')

    if (typeof auth !== 'undefined') {
      jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          return next()
        }

        res.locals.auth = decoded
        res.locals.validToken = true

        next()
      })
    } else {
      next()
    }
  })
}
