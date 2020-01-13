module.exports = async (db) => {
  console.log('Executing first migration')

  await db.query(`
    CREATE TABLE \`form\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) DEFAULT NULL,
      \`title\` varchar(256) DEFAULT NULL,
      \`props\` mediumtext,
      PRIMARY KEY (\`id\`),
      KEY \`user_id\` (\`user_id\`)
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
}
