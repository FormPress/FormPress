module.exports = async (db) => {
  await db.query(`
    CREATE TABLE \`admins\` (
    \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
    \`email\` varchar(512) NOT NULL DEFAULT '',
    PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
}
