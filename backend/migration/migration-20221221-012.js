module.exports = async (db) => {
  await db.query(`
      CREATE TABLE \`user_settings\` (
        \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) DEFAULT NULL,
        \`key\` varchar(256) NOT NULL,
        \`value\` varchar(256) NOT NULL,
        \`created_at\` datetime DEFAULT NULL,
        \`updated_at\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`user_id\` (\`user_id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
    `)
}
