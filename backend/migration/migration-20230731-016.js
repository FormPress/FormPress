module.exports = async (db) => {
  await db.query(`
    CREATE TABLE form_permission (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) DEFAULT NULL,
      \`form_id\` int(11) DEFAULT NULL,
      \`permissions\` varchar(512) DEFAULT NULL,
      \`target_user_id\` int(11) DEFAULT NULL,
      \`target_user_email\` varchar(512) DEFAULT NULL,
      \`created_at\` datetime DEFAULT   CURRENT_TIMESTAMP,
      \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)
}
