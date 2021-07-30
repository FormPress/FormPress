module.exports = async (db) => {
  await db.query(`
    ALTER TABLE \`user\`
    DROP COLUMN \`name\`
  `)

  await db.query(`
    ALTER TABLE \`user\`
    MODIFY \`password\` char(128) NULL
  `)

  await db.query(`
    ALTER TABLE \`user\`
    MODIFY \`salt\` char(128) NULL
  `)

  await db.query(`
    ALTER TABLE \`user\`
    ADD \`emailVerificationCode\` varchar(256) DEFAULT NULL,
    ADD \`emailVerified\` tinyint(1) DEFAULT '0',
    ADD \`passwordResetCode\` varchar(256) DEFAULT NULL,
    ADD \`passwordResetCodeExpireAt\` datetime DEFAULT NULL
  `)
}
