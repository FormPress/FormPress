const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.use((req, res, next) => {
    const { auth } = req.cookies

    if (auth) {
      jwt.verify(auth, JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          res.locals.badAuthCookie = true
          return next()
        }

        req.user = decoded

        let isValid = true

        if (req.user.user_id === 0) {
          // Demo user
          isValid = false
        }
        res.locals.validToken = isValid

        next()
      })
    } else {
      next()
    }
  })
}
