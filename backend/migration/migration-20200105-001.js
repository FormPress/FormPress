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
}
