const path = require('path')

const uuidAPIKey = require('uuid-apikey')
const { getPool } = require(path.resolve('./', 'db'))

const {
  mustHaveValidToken,
  paramShouldMatchTokenUserId
} = require(path.resolve('middleware', 'authorization'))

exports.apiKeys = (app) => {
  // return api keys
  app.get(
    '/api/users/:user_id/api-key',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id
      const result = await db.query(
        `SELECT * FROM \`api_key\` WHERE user_id = ?`,
        [user_id]
      )

      return res.json(result)
    }
  )

  // create a new api key
  app.post(
    '/api/users/:user_id/api-key',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id

      const name = req.body.name

      const api_key = uuidAPIKey.create().apiKey

      const result = await db.query(
        `
                INSERT INTO \`api_key\`
                  (user_id, api_key, created_at, name)
                VALUES
                  (?, ?, NOW(), ?)
              `,
        [user_id, api_key, name]
      )

      // based on the result, send the response
      if (result.affectedRows > 0) {
        return res.json({
          message: 'API key created successfully!',
          api_key,
          id: result.insertId
        })
      } else {
        return res.status(500).json({ message: 'Error creating API key' })
      }
    }
  )

  // delete api key
  app.delete(
    '/api/users/:user_id/api-key',
    mustHaveValidToken,
    paramShouldMatchTokenUserId('user_id'),
    async (req, res) => {
      const db = await getPool()
      const user_id = req.params.user_id
      const apiKeyId = req.body.apiKeyId

      // delete the api key that matches the id and user_id
      const result = await db.query(
        `
        DELETE FROM \`api_key\` WHERE id = ? AND user_id = ?
      `,
        [apiKeyId, user_id]
      )

      if (result.affectedRows > 0) {
        return res.status(200).json({ message: 'API key deleted' })
      } else {
        return res.status(404).json({ message: 'API key not found.' })
      }
    }
  )
}
