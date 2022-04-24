module.exports = async (db) => {
    await db.query(`
        ALTER TABLE \`user\`
        ADD \`isActive\` tinyint(1) DEFAULT '1'
    `)
  }
