exports.mustHaveValidToken = (req, res, next) => {
  if (res.locals.validToken === true) {
    next()
  } else {
    res.status(403).send({ message: 'Invalid Token' })
  }
}

exports.paramShouldMatchTokenUserId = (param) => (req, res, next) => {
  if (parseInt(req.params[param]) === res.locals.auth.user_id) {
    next()
  } else {
    res.status(403).send({ message: 'Invalid Token' }) 
  }
}
