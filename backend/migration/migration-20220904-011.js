module.exports = async (db) => {
  await db.query(`
      CREATE TABLE \`whitelist\` (
        \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) DEFAULT NULL,
        \`created_at\` datetime DEFAULT NULL,
        \`updated_at\` datetime DEFAULT NULL,
        \`deleted_at\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`user_id\` (\`user_id\`),
        KEY \`deleted_at\` (\`deleted_at\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
    `)
}
