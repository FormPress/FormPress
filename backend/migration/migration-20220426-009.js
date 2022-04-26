module.exports = async (db) => {
  await db.query(`
    update user set email=lower(email)`)
}
