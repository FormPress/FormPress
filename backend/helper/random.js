const crypto = require('crypto')

exports.genRandomString = (length) =>
  crypto
    .randomBytes(Math.ceil(length / 2))
    .toString('hex') /** convert to hexadecimal format */
    .slice(0, length) /** return required number of characters */

exports.sha512 = (password, salt) => {
  const hash = crypto.createHmac('sha512', salt) /** Hashing algorithm sha512 */

  hash.update(password)

  return {
    salt: salt,
    passwordHash: hash.digest('hex')
  }
}
