const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))

exports.locationFinder = async (user_id, cf_ipcountry, utm_source = false) => {
  const db = await getPool()

  if (![undefined, 'undefined', 'XX', 'xx', ''].includes(cf_ipcountry)) {
    const searchFirstLocation = await db.query(
      `SELECT * FROM \`user_settings\` WHERE user_id = ? AND \`key\` = ? AND \`value\` IS NOT NULL`,
      [user_id, 'location.first']
    )

    if (searchFirstLocation === false || searchFirstLocation.length === 0) {
      await db.query(
        `INSERT INTO \`user_settings\` (user_id, \`key\`, \`value\`, \`created_at\`) VALUES (?, ?, ?, NOW())`,
        [user_id, 'location.first', cf_ipcountry]
      )
      await db.query(
        `INSERT INTO \`user_settings\` (user_id, \`key\`, \`value\`, \`created_at\`) VALUES (?, ?, ?, NOW())`,
        [user_id, 'location.last', cf_ipcountry]
      )
    } else {
      const searchSecondLocation = await db.query(
        `SELECT * FROM \`user_settings\` WHERE user_id = ? AND \`key\` = ? AND \`value\` IS NOT NULL`,
        [user_id, 'location.last']
      )
      if (searchSecondLocation === false || searchSecondLocation.length === 0) {
        await db.query(
          `INSERT INTO \`user_settings\` (user_id, \`key\`, \`value\`, \`created_at\`) VALUES (?, ?, ?, NOW())`,
          [user_id, 'location.last', cf_ipcountry]
        )
      } else {
        await db.query(
          `UPDATE \`user_settings\` SET \`value\` = ?, \`updated_at\` = NOW() WHERE user_id = ? AND \`key\` = ?`,
          [cf_ipcountry, user_id, 'location.last']
        )
      }
    }
  }

  if (utm_source) {
    const searchUTMSource = await db.query(
      `SELECT * FROM \`user_settings\` WHERE user_id = ? AND \`key\` = ? AND \`value\` IS NOT NULL`,
      [user_id, 'utm_source']
    )

    if (searchUTMSource === false || searchUTMSource.length === 0) {
      await db.query(
        `INSERT INTO \`user_settings\` (user_id, \`key\`, \`value\`, \`created_at\`) VALUES (?, ?, ?, NOW())`,
        [user_id, 'utm_source', utm_source]
      )
    }
  }
}
