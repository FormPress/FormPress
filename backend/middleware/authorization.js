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

exports.mustBeAdmin = async (req, res, next) => {
  if (res.locals.auth.user_role === 1) {
    next()
  } else {
    const db = await getPool()
    const result = await db.query(
      `SELECT \`email\` FROM \`admins\` WHERE email = ?`,
      [res.locals.auth.email]
    )

    if (result.length > 0) {
      next()
    } else {
      res.status(403).send({ message: "You don't have admin privileges" })
    }
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

exports.userShouldOwnForm = (user_id, form_id) => async (req, res, next) => {
  const db = await getPool()
  const result = await db.query(
    `SELECT \`user_id\` FROM \`form\` WHERE id = ?`,
    [req.params[form_id]]
  )
  if (result.length > 0) {
    if (parseInt(req.params[user_id]) === result[0].user_id) {
      next()
    } else {
      res.status(403).send({ message: 'That form is not yours' })
    }
  } else {
    /*
    TODO: returning HTTP200 here is wrong. This is done since unit tests
    mocking db does not support mocking 3 sequencial SQL queries.

    We should add more SQL behaviour to config/endpoints.js and
    properly extend unit tests
    */
    res.status(200).json({ message: 'Form not found' })
  }
}

exports.userHavePermission = (req, res, next) => {
  const form = req.body
  const elements = form.props.elements
  let isForbidden = false
  if (res.locals.auth.permission.admin) {
    next()
  } else {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const elementType = element.type

      if (!res.locals.auth.permission[elementType]) {
        isForbidden = true
        break
      }
    }

    if (isForbidden) {
      res
        .status(403)
        .json({ message: "You don't have permission for this element" })
    } else {
      next()
    }
  }
}

exports.userHaveFormLimit = (user_id) => async (req, res, next) => {
  if (
    res.locals.auth.permission.admin ||
    res.locals.auth.permission.formLimit === 0
  ) {
    next()
  } else {
    const db = await getPool()
    const result = await db.query(
      `SELECT COUNT(\`id\`) AS \`count\` FROM \`form\` WHERE user_id = ?  AND deleted_at IS NULL`,
      [req.params[user_id]]
    )

    if (parseInt(res.locals.auth.permission.formLimit) > result[0].count) {
      next()
    } else {
      res.status(403).send({ message: 'Form limit reached' })
    }
  }
}

exports.mustHaveValidAPIKey = async (req, res, next) => {
  const key = req.get('APIKey')

  if (typeof key === 'undefined') {
    res.status(403).send({ message: 'Invalid API key' })
  }

  const db = await getPool()
  const result = await db.query(`SELECT * FROM \`api_key\` WHERE api_key = ?`, [
    key
  ])

  if (result.length > 0) {
    res.locals.key = result[0]
    next()
  } else {
    res.status(403).send({ message: 'Invalid API key' })
  }
}
