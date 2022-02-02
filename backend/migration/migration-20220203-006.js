module.exports = async (db) => {
  await db.query(`
      ALTER TABLE \`user\`
      ADD CONSTRAINT idx_email UNIQUE KEY(email);
    `)
}
