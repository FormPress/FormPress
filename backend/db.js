const mysql = require('promise-mysql')

let pool = false

const getPool = async () => {
  if (pool !== false) {
    return pool
  }

  pool = await mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    charset: 'utf8mb4'
  })

  return pool
}

module.exports = { getPool }
