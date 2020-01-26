const crypto = require('crypto')
const path = require('path')
const jwt = require('jsonwebtoken')

const { getPool } = require(path.resolve('./', 'db'))

const JWT_SECRET = process.env.JWT_SECRET
const genRandomString = (length) => crypto
  .randomBytes(Math.ceil(length/2))
  .toString('hex') /** convert to hexadecimal format */
  .slice(0,length)   /** return required number of characters */
const sha512 = (password, salt) => {
  const hash = crypto.createHmac('sha512', salt) /** Hashing algorithm sha512 */
  
  hash.update(password)

  return {
      salt: salt,
      passwordHash: hash.digest('hex')
  }
}

module.exports = (app) => {
  app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body
    const db = await getPool()

    const result = await db.query(
      `
        SELECT *
        FROM \`user\`
        WHERE email = ?
      `,
      [email]
    )

    if (result.length === 0) {
      const salt = genRandomString(128)
      const hash = sha512(password, salt)
      console.log(`DEBUG INSERT: ${email} `, hash, salt)

      return res.status(403).json({ message: 'Email/Password does not match' })
    } else {
      const user = result[0]
      const incomingHash = sha512(password, user.salt)

      if (user.password === incomingHash.passwordHash) {
        const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24 *7)
        const jwt_data = {
          user_id: user.id,
          email: user.email,
          exp
        }

        jwt.sign(jwt_data, JWT_SECRET, (err, token) => {
          console.log('SIGNED TOKEN ', token)
          res.status(200).json({
            message: 'Login Success',
            token,
            user_id: user.id,
            exp
          })
        })
        
      } else {
        console.log('PWD FALSE')
        res.status(403).json({ message: 'Email/Password does not match' })
      }
    }
  })
}

