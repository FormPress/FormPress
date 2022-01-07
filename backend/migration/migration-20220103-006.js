module.exports = async (db) => {
  await db.query(`
    CREATE TABLE \`payments\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) DEFAULT NULL,
      \`createdDate\` datetime DEFAULT NULL,
      \`startDate\` datetime DEFAULT NULL,
      \`referenceCode\` mediumtext,
      \`parentReferenceCode\` mediumtext,
      \`customerReferenceCode\` mediumtext,
      \`pricingPlanReferenceCode\` mediumtext,
      \`subscriptionStatus\` mediumtext,
      \`role_name\` mediumtext
      PRIMARY KEY (\`id\`),
      KEY \`user_id\` (\`user_id\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
  `)
}
