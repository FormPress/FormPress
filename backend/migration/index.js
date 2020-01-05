const fs = require('fs')
const path = require('path')

module.exports = async (db) => {
  console.log('Running migrations')

  const result = await db.query('SHOW TABLES')
  const dbName = process.env.MYSQL_DATABASE
  const tables = result.map((row) => row[`Tables_in_${dbName}`])

  if (tables.indexOf('migration') === -1) {
    console.log('Creating migration table')
    await db.query(`
      CREATE TABLE \`migration\` (
        \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
        \`name\` varchar(512) NOT NULL DEFAULT '',
        PRIMARY KEY (\`id\`),
        KEY \`name\` (\`name\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
  }

  const migrations = fs.readdirSync(path.resolve('./', 'migration'))
    .filter((name) => name.includes('migration-'))
  const executedMigrations = (await db.query('SELECT * FROM `migration`'))
    .map((row) => row.name)

  for (const migration of migrations) {
    if (executedMigrations.indexOf(migration) > -1) {
      console.log(`${migration} [ALREADY DONE]`)

      continue
    }

    console.log(`Running ${migration}`)
    const fn = require(path.resolve('./', 'migration', migration))

    await fn(db)
    await db.query(
      `INSERT INTO \`migration\`
        (\`name\`) VALUES
        (?)
      `,
      [migration]
    )
  }

  console.log('All migrations have been executed')
}
