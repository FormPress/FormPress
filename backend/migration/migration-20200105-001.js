const { genRandomString, sha512 } = require('../helper/random')
const adminPassword = process.env.ADMINPASSWORD
const adminEmail = process.env.ADMINEMAIL
module.exports = async (db) => {
  console.log('Executing first migration')

  await db.query(`
    CREATE TABLE \`form\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) DEFAULT NULL,
      \`title\` varchar(256) DEFAULT NULL,
      \`props\` mediumtext,
      \`published_version\` int(11) DEFAULT NULL,
      \`created_at\` datetime DEFAULT NULL,
      \`updated_at\` datetime DEFAULT NULL,
      \`deleted_at\` datetime DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`user_id\` (\`user_id\`),
      KEY \`deleted_at\` (\`deleted_at\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
  `)

  await db.query(`
    CREATE TABLE \`form_published\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) DEFAULT NULL,
      \`form_id\` int(11) DEFAULT NULL,
      \`title\` varchar(256) DEFAULT NULL,
      \`props\` mediumtext,
      \`version\` int(11) DEFAULT NULL,
      \`created_at\` datetime DEFAULT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`user_id\` (\`user_id\`),
      KEY \`form_id\` (\`form_id\`),
      KEY \`version\` (\`version\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  await db.query(`
    CREATE TABLE \`submission\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`form_id\` int(11) DEFAULT NULL,
      \`created_at\` datetime DEFAULT NULL,
      \`updated_at\` datetime DEFAULT NULL,
      \`read\` tinyint(11) DEFAULT '0',
      PRIMARY KEY (\`id\`),
      KEY \`form_id\` (\`form_id\`),
      KEY \`created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  await db.query(`
    CREATE TABLE \`entry\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`form_id\` int(11) NOT NULL,
      \`submission_id\` int(11) DEFAULT NULL,
      \`question_id\` int(11) NOT NULL,
      \`value\` longtext,
      PRIMARY KEY (\`id\`),
      KEY \`form_id\` (\`form_id\`),
      KEY \`submission_id\` (\`submission_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  await db.query(`
    CREATE TABLE \`user\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`name\` varchar(256) DEFAULT NULL,
      \`email\` varchar(512) NOT NULL DEFAULT '',
      \`password\` char(128) NOT NULL DEFAULT '',
      \`salt\` char(128) NOT NULL DEFAULT '',
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4;
  `)

  const hash = sha512(adminPassword, genRandomString(128))

  await db.query(`
    INSERT INTO \`user\`
      (name, email, password, salt)
    VALUES
      ('Admin', '${adminEmail}', '${hash.passwordHash}', '${hash.salt}')
  `)
}
