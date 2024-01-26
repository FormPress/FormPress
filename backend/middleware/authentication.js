const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

module.exports = (app) => {
  app.use((req, res, next) => {
    const bearerAuth = req.get('Authorization')?.split(' ')[1]
    console.log('bearerAuth', bearerAuth)

    const cookieAuth = req.cookies.auth

    console.log('cookieAuth', cookieAuth)
    const auth = bearerAuth || cookieAuth

    console.log('final auth', auth)

    if (auth) {
      jwt.verify(auth, JWT_SECRET, (err, decoded) => {
        if (err !== null) {
          console.log('err', err)

          res.clearCookie('auth', {
            domain: process.env.COOKIE_DOMAIN,
            path: '/'
          })
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
