module.exports = async (db) => {
  await db.query(`
    CREATE TABLE form_evaluation (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`form_id\` int(11) DEFAULT NULL,
      \`form_published_id\` int(11) DEFAULT NULL,
      \`evaluator_id\` int(11) DEFAULT NULL,
      \`type\` varchar(50) DEFAULT NULL,
      \`approver_id\` int(11) DEFAULT NULL,
      \`vote\` int(11) DEFAULT '0',
      \`evaluated_at\` datetime DEFAULT CURRENT_TIMESTAMP,
      \`approved_at\` datetime DEFAULT NULL,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `)

  await db.query(`
    ALTER TABLE \`form_published\`
    ADD \`evaluated\` tinyint(1) DEFAULT '0'
  `)
}
