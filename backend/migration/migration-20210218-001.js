module.exports = async (db) => {
  await db.query(`
    ALTER TABLE \`submission\`
    ADD \`version\` int(11) DEFAULT NULL
  `)
}