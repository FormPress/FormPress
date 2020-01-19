const jwt = require('jsonwebtoken')
const path = require('path')
const getPool = require(path.resolve('./', 'db'))

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.use((req, res, next) => {
    const auth = req.get('Authorization')

    if (typeof auth !== 'undefined') {
      jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          return res.status(403).send({ message: 'Invalid Token'})
        }
        console.log('Auth Middleware setting decoded auth:', decoded)
        res.locals.auth = decoded

        next()
      })
    } else {
      next()
    }
  })
}
