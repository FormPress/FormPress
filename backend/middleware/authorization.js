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

exports.mustBeAdmin = (req, res, next) => {
  if (res.locals.auth.user_role === 1) {
    next()
  } else {
    res.status(403).send({ message: 'You don\'t have admin privileges' })
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
    /*
    TODO: returning HTTP200 here is wrong. This is done since unit tests
    mocking db does not support mocking 3 sequencial SQL queries.

    We should add more SQL behaviour to config/endpoints.js and
    properly extend unit tests
    */
    res.status(200).json({ message: 'Submission not found' })
  }
}
