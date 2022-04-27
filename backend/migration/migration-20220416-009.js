module.exports = async (db) => {
  await db.query(`
    ALTER TABLE \`submission\`
    ADD \`completion_time\` int(11) DEFAULT 0
  `)
}
