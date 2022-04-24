const path = require('path')

const { getPool } = require(path.resolve('./', 'db'))
const { genRandomString, sha512 } = require(path.resolve('helper')).random
const { error } = require(path.resolve('helper'))
const jwt = require('jsonwebtoken')

const { mustHaveValidToken, mustBeAdmin } = require(path.resolve(
  'middleware',
  'authorization'
))

const JWT_SECRET = process.env.JWT_SECRET

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

        res.status(200).send({
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
            u.id, u.email, u.emailVerified, u.isActive, 
            ur.role_id AS role_id,
            r.permission AS permission
          FROM \`user\` AS u
            JOIN \`user_role\` AS ur ON u.id = ur.user_id
            JOIN role AS r ON r.id = ur.\`role_id\`
      `)

      if (result.length > 0) {
        res.json(result)
      } else {
        res.json([])
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
      let result = null;

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
          if (typeof roleId !== 'undefined' &&
          roleId !== null &&
          roleId !== '0' ) {
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
              res.status(403).json({
                message: 'Role id must be valid.'
              })
            }
          }
          if (typeof isActive !== 'undefined' && 
          isActive !== null && 
          (isActive == 0 || isActive == 1)) {
              await db.query(
                `
                  UPDATE \`user\`
                  SET \`isActive\` = ?
                  WHERE id = ?
                `,
                [isActive, user_id]
              )         
          }

          res.status(200).json({ message: 'User changed succesfully' })
      } else {
        res.status(403).json({ message: 'User not found' })
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
      let result = null;

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
          res.status(403).json({
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
          res.status(200).json({ message: 'Password changed succesfully' })
        }

      } else {
        res.status(403).json({ message: 'User not found' })
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
      let result = null;

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
            r.permission AS permission
          FROM \`user\` AS u
            JOIN \`user_role\` AS ur ON u.id = ur.user_id
            JOIN role AS r ON r.id = ur.\`role_id\`
          WHERE u.id = ? AND u.emailVerified = 1
        `,
          [user_id]
        )
      }
      if (result.length === 1) {
        const user = result[0];
        const admin = await db.query(
          `SELECT \`id\` FROM \`admins\` WHERE email = ?`,
          [res.locals.auth.email]
        )

        const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
        const jwt_data = {
          user_id: user.id,
          email: user.email,
          user_role: user.role_id,
          admin: false,
          inPersonate: admin[0].id,
          permission: JSON.parse(user.permission),
          exp
        }

        jwt.sign(jwt_data, JWT_SECRET, (err, token) => {
          console.log('token sign error ', err)
          error.errorReport(err)

          res.status(200).json({
            message: 'Login Success',
            token,
            user_role: user.role_id,
            admin: false,
            inPersonate: admin[0].id,
            user_id: user.id,
            permission: JSON.parse(user.permission),
            exp
          })
        })

      } else {
        res.status(403).json({ message: 'User not found' })
      }
    }
  )
}
