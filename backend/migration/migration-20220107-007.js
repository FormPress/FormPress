module.exports = async (db) => {
  await db.query(`
      CREATE TABLE \`storage_usage\` (
        \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) DEFAULT NULL,
        \`form_id\` int(11) DEFAULT NULL,
        \`submission_id\` int(11) DEFAULT NULL,
        \`entry_id\` int(11) DEFAULT NULL,
        \`upload_name\` varchar(256) DEFAULT NULL,
        \`size\` int(11) DEFAULT NULL,
        \`created_at\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`user_id\` (\`user_id\`),
        KEY \`form_id\` (\`form_id\`),
        KEY \`submission_id\` (\`submission_id\`),
        KEY \`entry_id\` (\`entry_id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
    `)
}
