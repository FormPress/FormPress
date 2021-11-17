const path = require('path')

const { getPool } = require(path.resolve('./', 'db'))

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
  
      if (typeof role_id !== 'undefined' && role_id !== null && role_id !== '0') {
        //existing role update
        await db.query(
          `
            UPDATE \`role\` SET \`name\` = ?, \`permission\` = ? WHERE id = ?
          `,
          [name, JSON.stringify(permissions), role_id]
        )

        res.status(200).send({message: 'Role saved successfully', roleId: role_id})
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

        res.status(200).send({message: 'role created successfully', roleId: result.insertId})
      }
    }
  )
}
