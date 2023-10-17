module.exports = async (db) => {
  await db.query(`
    ALTER TABLE \`submission\`
    ADD INDEX \`read\` (\`read\`)
  `)
}
