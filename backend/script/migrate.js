const path = require('path')
const migrations = require(path.resolve('./', 'migration'))
const getPool = require(path.resolve('./', 'db'))

const main = async () => {
  await migrations(await getPool())
  process.exit()
}

main()
