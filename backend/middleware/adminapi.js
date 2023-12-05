const path = require('path')

const { getPool } = require(path.resolve('./', 'db'))
const { genRandomString, sha512 } = require(path.resolve('helper')).random
const { token } = require(path.resolve('helper')).token

const { mustHaveValidToken, mustBeAdmin } = require(path.resolve(
  'middleware',
  'authorization'
))

module.exports = (app) => {
  app.get(
    '/api/admin/roles',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const db = await getPool()
      //id = 1 admin role
      const result = await db.query(`
        SELECT
          *
        FROM \`role\`
        WHERE id != 1
      `)

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  app.put(
    '/api/admin/roles/:role_id/',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { role_id } = req.params
      const { name, permissions } = req.body
      const db = await getPool()

      if (
        typeof role_id !== 'undefined' &&
        role_id !== null &&
        role_id !== '0'
      ) {
        //existing role update
        await db.query(
          `
            UPDATE \`role\` SET \`name\` = ?, \`permission\` = ? WHERE id = ?
          `,
          [name, JSON.stringify(permissions), role_id]
        )

        res
          .status(200)
          .send({ message: 'Role saved successfully', roleId: role_id })
      } else {
        //create new role
        const result = await db.query(
          `
            INSERT INTO \`role\` 
              (name, permission)
             VALUES
              (?, ?)
          `,
          [name, JSON.stringify(permissions)]
        )

        return res.status(200).send({
          message: 'role created successfully',
          roleId: result.insertId
        })
      }
    }
  )

  app.get(
    '/api/admin/users',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const db = await getPool()
      const result = await db.query(`
        SELECT
            id, email, created_at, isActive
          FROM \`user\` WHERE emailVerified = 1 ORDER BY \`created_at\` DESC
      `)

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  app.get(
    '/api/admin/users/:user_id',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { user_id } = req.params
      const db = await getPool()
      const result = await db.query(
        `
      SELECT
          u.id, u.email, u.emailVerified, u.isActive, u.created_at,
          ur.role_id AS role_id,
          r.name AS role_name
        FROM \`user\` AS u
          JOIN \`user_role\` AS ur ON u.id = ur.user_id
          JOIN role AS r ON r.id = ur.\`role_id\`
        WHERE u.id = ?
    `,
        [user_id]
      )

      if (result.length > 0) {
        const lastFiveForms = await db.query(
          `SELECT \`uuid\`, \`created_at\` FROM \`form\` WHERE user_id = ? ORDER BY \`created_at\` DESC LIMIT 5`,
          [user_id]
        )
        result[0].forms = lastFiveForms
        const lastLocation = await db.query(
          `SELECT \`value\` FROM \`user_settings\` WHERE user_id = ? AND \`key\` = ?`,
          [user_id, 'location.last']
        )
        result[0].lastLocation = lastLocation
        res.json(result)
      } else {
        res.status(404).json({ message: 'User not found' })
      }
    }
  )

  app.put(
    '/api/admin/users/:user_id',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { user_id } = req.params
      const { roleId, isActive } = req.body
      const db = await getPool()
      let result = null

      if (
        typeof user_id !== 'undefined' &&
        user_id !== null &&
        user_id !== '0'
      ) {
        result = await db.query(
          `
          SELECT * FROM \`user\` WHERE id = ?
        `,
          [user_id]
        )
      }
      if (result.length === 1) {
        if (
          typeof roleId !== 'undefined' &&
          roleId !== null &&
          roleId !== '0'
        ) {
          const response = await db.query(
            `
              SELECT * FROM \`role\` WHERE id = ?
            `,
            [roleId]
          )

          if (response.length === 1) {
            await db.query(
              `
                  UPDATE \`user_role\`
                  SET \`role_id\` = ?
                  WHERE user_id = ?
                `,
              [roleId, user_id]
            )
          } else {
            return res.status(403).json({
              message: 'Role id must be valid.'
            })
          }
        }
        if (
          typeof isActive !== 'undefined' &&
          isActive !== null &&
          (parseInt(isActive) === 0 || 1)
        ) {
          await db.query(
            `
                  UPDATE \`user\`
                  SET \`isActive\` = ?
                  WHERE id = ?
                `,
            [isActive, user_id]
          )
        }
        return res.status(200).json({ message: 'User changed succesfully' })
      } else {
        return res.status(404).json({ message: 'User not found' })
      }
    }
  )

  app.put(
    '/api/admin/users/:user_id/changepassword',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { user_id } = req.params
      const { new_password } = req.body
      const db = await getPool()
      let result = null

      if (
        typeof user_id !== 'undefined' &&
        user_id !== null &&
        user_id !== '0'
      ) {
        result = await db.query(
          `
          SELECT * FROM \`user\` WHERE id = ?
        `,
          [user_id]
        )
      }
      if (result.length === 1) {
        let pattern = /^.{8,}$/
        if (!pattern.test(new_password)) {
          return res.status(403).json({
            message: 'New password must contain at least 8 characters.'
          })
        } else {
          const hash = sha512(new_password, genRandomString(128))
          await db.query(
            `
              UPDATE \`user\`
              SET \`password\` = ?, \`salt\` = ?, \`emailVerified\` = 1
              WHERE id = ?
            `,
            [hash.passwordHash, hash.salt, user_id]
          )
          return res
            .status(200)
            .json({ message: 'Password changed succesfully' })
        }
      } else {
        return res.status(404).json({ message: 'User not found' })
      }
    }
  )

  app.post(
    '/api/admin/users/:user_id/login-as-user',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { user_id } = req.params
      const db = await getPool()
      let result = null

      if (
        typeof user_id !== 'undefined' &&
        user_id !== null &&
        user_id !== '0'
      ) {
        result = await db.query(
          `
          SELECT
            u.*,
            ur.role_id AS role_id,
            r.name AS role_name,
            r.permission AS permission
          FROM \`user\` AS u
            JOIN \`user_role\` AS ur ON u.id = ur.user_id
            JOIN role AS r ON r.id = ur.\`role_id\`
          WHERE u.id = ?
        `,
          [user_id]
        )
      }
      if (result.length === 1) {
        const user = result[0]
        const admin = await db.query(
          `SELECT \`id\` FROM \`user\` WHERE email = ?`,
          [req.user.email]
        )

        const jwt_data = {
          user_id: user.id,
          email: user.email,
          user_role: user.role_id,
          role_name: user.role_name,
          admin: false,
          impersonate: admin[0].id,
          permission: JSON.parse(user.permission)
        }

        const data = await token(jwt_data)

        res.cookie('auth', data, {
          domain: process.env.COOKIE_DOMAIN,
          maxAge: 3 * 24 * 60 * 60 * 1000,
          secure: true,
          sameSite: 'none',
          httpOnly: true
        })

        return res.status(200).json(jwt_data)
      } else {
        return res.status(404).json({ message: 'User not found' })
      }
    }
  )

  app.post(
    '/api/admin/users/logout-as-user',
    mustHaveValidToken,
    async (req, res) => {
      const db = await getPool()
      const result = await db.query(
        `
        SELECT
          u.*,
          ur.role_id AS role_id,
          r.name AS role_name,
          r.permission AS permission
        FROM \`user\` AS u
          JOIN \`user_role\` AS ur ON u.id = ur.user_id
          JOIN role AS r ON r.id = ur.\`role_id\`
        WHERE u.id = ? AND u.emailVerified = 1
      `,
        [req.user.impersonate]
      )
      if (result.length === 1) {
        const user = result[0]
        const jwt_data = {
          user_id: user.id,
          email: user.email,
          user_role: user.role_id,
          role_name: user.role_name,
          admin: true,
          permission: JSON.parse(user.permission)
        }

        const data = await token(jwt_data)

        res.cookie('auth', data, {
          domain: process.env.COOKIE_DOMAIN,
          maxAge: 3 * 24 * 60 * 60 * 1000,
          secure: true,
          sameSite: 'none',
          httpOnly: true
        })

        return res.status(200).json({ message: 'Logged out as user' })
      } else {
        return res.status(403).json({ message: 'Invalid Token' })
      }
    }
  )

  app.post(
    '/api/admin/whitelist/:user_id',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { user_id } = req.params
      const db = await getPool()
      let data = null

      if (
        typeof user_id !== 'undefined' &&
        user_id !== null &&
        user_id !== '0'
      ) {
        const result = await db.query(
          `SELECT * FROM \`whitelist\` WHERE user_id = ?`,
          [user_id]
        )

        if (result.length > 0) {
          return res.json({ success: true })
        } else {
          data = await db.query(
            `
              INSERT INTO \`whitelist\`
                (user_id, created_at)
              VALUES
                (?, NOW())
            `,
            [user_id]
          )

          if (data) {
            return res.json({ success: true })
          } else {
            return res.status(500).json({ message: 'error' })
          }
        }
      }
    }
  )

  app.get(
    '/api/admin/whitelist',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const db = await getPool()
      const result = await db.query(`
        SELECT
            u.email
          FROM \`whitelist\` AS wl
            JOIN user AS u ON u.id = wl.\`user_id\` ORDER BY wl.\`created_at\` DESC
      `)

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  app.get(
    '/api/admin/evaluate/forms',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const db = await getPool()
      const limitPerRun = 10
      let query = `
        SELECT fp.id, fp.form_id, fp.props, u.id as uid, u.email as email, f.uuid
        FROM form_published fp, user u, form f
        WHERE fp.user_id = u.id AND fp.form_id = f.id AND u.\`isActive\` = 1 AND fp.\`version\` = f.\`published_version\` AND fp.evaluated = 0
        ORDER BY fp.id ASC LIMIT ${limitPerRun}
      `
      const result = await db.query(query)
      if (result.length > 0) {
        result.forEach((form) => {
          const props = JSON.parse(form.props)
          form.props = JSON.stringify(props.elements)
        })
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  app.get(
    '/api/admin/evaluate/forms/:form_published_id',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { form_published_id } = req.params
      const db = await getPool()
      const result = await db.query(
        `
        SELECT p.*, f.uuid
        FROM \`form_published\` p
        LEFT JOIN \`form\` f
        ON p.form_id = f.id
        WHERE p.id = ?
        `,
        [form_published_id]
      )

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  app.post(
    '/api/admin/evaluate/forms/:form_published_id',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { form_published_id } = req.params
      const form = req.body.form
      const { user_id } = req.user
      const db = await getPool()
      await db.query(
        `
      UPDATE \`form_published\` SET \`evaluated\` = 1 WHERE id = ?
      `,
        [form_published_id]
      )
      await db.query(
        `
        INSERT INTO \`form_evaluation\`
         (form_id, form_published_id, evaluator_id, type)
        VALUES
          (?, ?, ?, ?)
        `,
        [form.form_id, form.id, user_id, req.body.type]
      )

      return res.status(200).send({
        message: 'Evaluated successfully'
      })
    }
  )

  app.get(
    '/api/admin/evaluate/evaluations/:specs',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const db = await getPool()
      const limitPerRun = 10
      const { specs } = req.params
      const { cursor } = req.query
      let query = ''
      if (specs === 'approved') {
        query = `
          SELECT e.*, u.email AS evaluator, u2.email AS approver, p.props
          FROM \`form_evaluation\` e
          LEFT JOIN \`user\` u
          ON e.evaluator_id = u.id
          LEFT JOIN \`user\` u2
          ON e.approver_id = u2.id
          LEFT JOIN \`form_published\` p
          ON e.form_published_id = p.id
          WHERE e.approver_id IS NOT NULL 
          AND e.id > ${cursor}
          ORDER BY id ASC LIMIT ${limitPerRun};
        `
      } else if (specs === 'notapproved') {
        query = `
          SELECT e.*, u.email AS evaluator, p.props
          FROM \`form_evaluation\` e
          LEFT JOIN \`user\` u
          ON e.evaluator_id = u.id
          LEFT JOIN \`form_published\` p
          ON e.form_published_id = p.id
          WHERE e.approver_id IS NULL ORDER BY e.id ASC LIMIT ${limitPerRun}
        `
      } else if (specs === 'good') {
        query = `
          SELECT e.*, u.email AS evaluator, p.props
          FROM \`form_evaluation\` e
          LEFT JOIN \`user\` u
          ON e.evaluator_id = u.id
          LEFT JOIN \`form_published\` p
          ON e.form_published_id = p.id
          WHERE e.approver_id IS NULL AND e.type = 'good' ORDER BY e.id ASC LIMIT ${limitPerRun}
        `
      } else if (specs === 'bad') {
        query = `
          SELECT e.*, u.email AS evaluator, p.props
          FROM \`form_evaluation\` e
          LEFT JOIN \`user\` u
          ON e.evaluator_id = u.id
          LEFT JOIN \`form_published\` p
          ON e.form_published_id = p.id
          WHERE e.approver_id IS NULL AND e.type = 'bad' ORDER BY id ASC LIMIT ${limitPerRun}
        `
      }
      const result = await db.query(query)

      if (result.length > 0) {
        result.forEach((form) => {
          const props = JSON.parse(form.props)
          form.props = JSON.stringify(props.elements)
        })
        res.json(result)
      } else {
        res.json([])
      }
    }
  )

  app.get(
    '/api/admin/evaluate/delete/:evaluationId/:form_published_id',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { evaluationId, form_published_id } = req.params
      const db = await getPool()

      await db.query(
        `
        DELETE FROM \`form_evaluation\`
        WHERE \`id\` = ?
      `,
        [evaluationId]
      )
      await db.query(
        `
        UPDATE \`form_published\` SET \`evaluated\` = 0 WHERE id = ?
      `,
        [form_published_id]
      )
      return res.status(200).send({
        message: 'Deleted evaluation successfully'
      })
    }
  )

  app.get(
    '/api/admin/evaluate/approve/:evaluationId',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { evaluationId } = req.params
      const { user_id } = req.user
      const db = await getPool()

      await db.query(
        `
      UPDATE \`form_evaluation\` SET \`approver_id\` = ?, \`approved_at\` = CURRENT_TIMESTAMP WHERE id = ?
      `,
        [user_id, evaluationId]
      )

      return res.send({ message: 'Approved' })
    }
  )

  app.get(
    '/api/admin/evaluate/:evaluationId/vote/:vote',
    mustHaveValidToken,
    mustBeAdmin,
    async (req, res) => {
      const { evaluationId, vote } = req.params
      const db = await getPool()
      let operation = '+'
      if (vote === 'down') {
        operation = '-'
      }
      await db.query(
        `
      UPDATE \`form_evaluation\` SET \`vote\` = \`vote\` ${operation} 1 WHERE id = ?
      `,
        [evaluationId]
      )

      return res.send({ message: 'voted' })
    }
  )
}
