const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

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

exports.userShouldOwnSubmission = (user_id, submission_id) => async (
  req,
  res,
  next
) => {
  const db = await getPool()
  const result = await db.query(
    `SELECT
      user_id
    FROM
      form 
    WHERE
      id = (
        SELECT
          form_id
        FROM
          submission
        WHERE
      id = ?)
  `,
    [req.params[submission_id]]
  )
  if (result.length > 0) {
    if (parseInt(req.params[user_id]) === result[0].user_id) {
      next()
    } else {
      res.status(403).send({ message: 'That submission is not yours' })
    }
  } else {
    res.status(404).json({ message: 'Submission not found' })
  }
}
