const path = require('path')
const jwt = require('jsonwebtoken')
const { error } = require(path.resolve('helper'))

const JWT_SECRET = process.env.JWT_SECRET

exports.token = (jwt_data) => {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
  jwt_data = { ...jwt_data, exp }

  const token = jwt.sign(jwt_data, JWT_SECRET)

  if (token) {
    return token
  } else {
    error.errorReport('token sign error')
    return null
  }
}
