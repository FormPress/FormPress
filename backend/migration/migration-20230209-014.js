// Thank you pages table migration

const fs = require('fs')
const path = require('path')
const defaultThankYouPage = fs.readFileSync(
  path.join(__dirname, '../views/defaultThankYou.ejs'),
  'utf8'
)

module.exports = async (db) => {
  await db.query(`
      CREATE TABLE \`custom_thank_you\` (  
        \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
        \`user_id\` int(11) DEFAULT NULL,
        \`title\` varchar(256) DEFAULT NULL,
        \`html\` mediumtext,
        \`created_at\` datetime DEFAULT NULL,
        \`updated_at\` datetime DEFAULT NULL,
        PRIMARY KEY (\`id\`),
        KEY \`user_id\` (\`user_id\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
    `)

  await db.query(`
      INSERT INTO \`custom_thank_you\` (\`user_id\`, \`title\`, \`html\`, \`created_at\`, \`updated_at\`) VALUES (0, 'Default Thank You Page', '${defaultThankYouPage}', NOW(), NOW());
    `)
}
