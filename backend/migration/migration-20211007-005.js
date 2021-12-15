const adminEmail = process.env.ADMINEMAIL || 'admin@formpress.org'

module.exports = async (db) => {
  await db.query(`
    CREATE TABLE \`user_role\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) NOT NULL,
      \`role_id\` int(11) NOT NULL,
      PRIMARY KEY (\`id\`),
      KEY \`user_id\` (\`user_id\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
  `)

  await db.query(`
    CREATE TABLE \`role\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`name\` varchar(256) DEFAULT NULL,
      \`permission\` mediumtext,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
  `)

  await db.query(`
    CREATE TABLE \`submission_usage\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT,
      \`user_id\` int(11) NOT NULL,
      \`date\` varchar(64) DEFAULT NULL,
      \`count\` int(11) DEFAULT 0,
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8mb4;
  `)
  //permissions are placeholders needs to be changed
  await db.query(`
    INSERT INTO \`role\`
      (name, permission)
    VALUES
      ('admin','{"admin":true}')
  `)

  await db.query(`
    INSERT INTO \`role\`
      (name, permission)
    VALUES
      ('free', '{"admin":false}')
  `)

  await db.query(`
    ALTER TABLE \`user\`
    ADD \`created_at\` datetime DEFAULT   CURRENT_TIMESTAMP,
    ADD \`updated_at\` datetime ON UPDATE CURRENT_TIMESTAMP
  `)

  await db.query(`
    ALTER TABLE \`form\`
    MODIFY \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  `)

  await db.query(`
    ALTER TABLE \`form\`
    ADD INDEX updated_at (\`updated_at\`)
  `)

  await db.query(`
    ALTER TABLE \`submission\`
    MODIFY \`updated_at\` datetime ON UPDATE CURRENT_TIMESTAMP
  `)

  await db.query(
    `
    UPDATE \`user\`
    SET \`emailVerified\` = 1
    WHERE email = ?
  `,
    [adminEmail]
  )

  await db.query(`
    ALTER TABLE \`user_role\`
      ADD UNIQUE (\`user_id\`)
  `)
  //fill user_role table
  const adminUserIdResult = await db.query(
    `SELECT \`id\` FROM \`user\` WHERE email = '${adminEmail}'`
  )
  const adminUserId = adminUserIdResult[0].id
  const adminRoleId = 1 // hardcoded in mustBeAdmin authorization middleware
  const freeRoleId = 2 // hardcoded in signUp middleware for new users

  const otherUsers = await db.query(
    `SELECT \`id\` 
    FROM \`user\`
    WHERE email != ?
    `,
    [adminEmail]
  )

  await db.query(
    `INSERT INTO \`user_role\`
      (user_id, role_id)
      VALUES
      (?, ?)
    `,
    [adminUserId, adminRoleId]
  )
  for (const user of otherUsers) {
    const userId = user.id
    await db.query(
      `INSERT INTO \`user_role\`
        (user_id, role_id)
        VALUES
        (?, ?)
      `,
      [userId, freeRoleId]
    )
  }
}
