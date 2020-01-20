exports.mustHaveValidToken = (req, res, next) => {
  if (res.locals.validToken === true) {
    next()
  } else {
    res.status(403).send({ message: 'Invalid Token'})
  }
}
