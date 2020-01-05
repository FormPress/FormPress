const mysql = require('promise-mysql')

const getPool  = async () => {
  return await mysql.createPool({
    connectionLimit : 10,
    host : process.env.MYSQL_HOST,
    user : process.env.MYSQL_USER,
    password : process.env.MYSQL_PASSWORD,
    database : process.env.MYSQL_DATABASE
  })
}

module.exports = getPool
