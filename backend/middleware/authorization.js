const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const { FP_ENV, FE_FRONTEND } = process.env

exports.ensureLoggedIn = (req, res, next) => {
  if (req.user && res.locals.validToken) {
    next()
  } else {
    if (FP_ENV === 'development') {
      // in development, full url should consist of protocol, host, port, and path
      let originalDestination = `${req.protocol}://${req.get('host')}${
        req.originalUrl
      }`

      const loginUrl =
        FE_FRONTEND +
        '/login?destination=' +
        encodeURIComponent(originalDestination)

      return res.redirect(loginUrl)
    } else {
      const originalDestination = req.originalUrl
      const loginUrl =
        '/login?destination=' + encodeURIComponent(originalDestination)
      return res.redirect(loginUrl)
    }
  }
}

exports.mustHaveValidToken = (req, res, next, cb = null) => {
  if (res.locals.validToken === true) {
    next()
  } else {
    if (cb !== null) {
      return cb(req, res, next)
    } else {
      return res.status(403).send({ message: 'Invalid Token' })
    }
  }
}

exports.paramShouldMatchTokenUserId = (param) => (req, res, next) => {
  if (parseInt(req.params[param]) === req.user.user_id) {
    next()
  } else {
    res.status(403).send({ message: 'Invalid Token User Id' })
  }
}

exports.mustBeAdmin = async (req, res, next) => {
  if (req.user.user_role === 1) {
    next()
  } else {
    const db = await getPool()
    const result = await db.query(
      `SELECT \`email\` FROM \`admins\` WHERE email = ?`,
      [req.user.email]
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

/*
  If param sharedPermissions is given, upon detecting form does not belong to user
  we should check if form is shared with user with exact given permissions

  if not given, then form must be shared with all 3 permissions, read, edit and data

  matchType determines type of match, possible values, strict or loose
    - *strict* means form must be shared with all specified values
    - *loose* means, form must be shared at least 1 of specified permissions

  Examples:

  {read:true, matchType: 'strict'}
    => Returns true only if read permission is given, other 2 permissions does not matter

*/
exports.userShouldOwnForm = (
  user_id_arg,
  form_id_arg,
  sharedPermissions = {
    matchType: 'strict',
    read: true,
    edit: true,
    data: true
  }
) => async (req, res, next) => {
  const form_id =
    typeof form_id_arg === 'function'
      ? form_id_arg(req)
      : req.params[form_id_arg]
  const user_id = req.params[user_id_arg]

  const db = await getPool()
  const result = await db.query(
    `SELECT \`user_id\` FROM \`form\` WHERE id = ?`,
    [form_id]
  )
  if (result.length > 0) {
    if (parseInt(user_id) === result[0].user_id) {
      return next()
    } else {
      // Check if shared
      const sharedResult = await db.query(
        `SELECT * FROM \`form_permission\` WHERE target_user_id = ? AND form_id = ?`,
        [user_id, form_id]
      )

      if (sharedResult.length > 0) {
        const permissions = JSON.parse(sharedResult[0].permissions)
        let matchCount = 0

        for (const key of Object.keys(sharedPermissions)) {
          if (
            key !== 'matchType' &&
            permissions[key] === sharedPermissions[key]
          ) {
            matchCount++
          }
        }

        if (
          (sharedPermissions.matchType === 'loose' && matchCount > 0) ||
          (sharedPermissions.matchType === 'strict' &&
            matchCount === Object.keys(sharedPermissions).length - 1)
        ) {
          res.locals.sharedUserId = sharedResult[0].user_id
          res.locals.sharedPermissions = permissions

          return next()
        }
      }

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
  if (req.user.permission.admin) {
    next()
  } else {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i]
      const elementType = element.type

      if (!req.user.permission[elementType]) {
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
  if (req.user.permission.admin || req.user.permission.formLimit === 0) {
    next()
  } else {
    const db = await getPool()
    const result = await db.query(
      `SELECT COUNT(\`id\`) AS \`count\` FROM \`form\` WHERE user_id = ?  AND deleted_at IS NULL`,
      [req.params[user_id]]
    )

    if (parseInt(req.user.permission.formLimit) > result[0].count) {
      next()
    } else {
      res.status(403).send({ message: 'Form limit reached' })
    }
  }
}

exports.mustHaveValidAPIKey = async (req, res, next) => {
  const key = req.body.APIKey

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
