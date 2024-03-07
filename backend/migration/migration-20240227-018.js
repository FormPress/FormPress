module.exports = async (db) => {
  await db.query(`
      CREATE TABLE \`templates\` (
        \`id\` int(11) unsigned NOT NULL,
        \`times_cloned\` int(11) unsigned NOT NULL,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
}
