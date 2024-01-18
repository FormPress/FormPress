module.exports = async (db) => {
  await db.query(`
    ALTER TABLE \`api_key\`
    ADD COLUMN \`name\` VARCHAR(255) DEFAULT 'New API Key' NOT NULL;
  `)
}
