module.exports = async (db) => {
  await db.query(`
      CREATE TABLE \`oauth_data\` (  
        \`id\` varchar(256),
        \`user_id\` int(11) unsigned NOT NULL,
        \`client_id\` varchar(255) NOT NULL,
        \`authorization_code\` mediumtext,
        \`scope\` varchar(256),
        \`redirect_uri\` varchar(256),
        \`access_token\` mediumtext,
        \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
}
