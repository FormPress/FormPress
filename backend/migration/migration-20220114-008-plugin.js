module.exports = async (db) => {
  await db.query(`
    INSERT INTO \`role\`
      (id, name, permission)
    VALUES
      ('3', 'Silver', '{"admin":false,"formLimit":"10","submissionLimit":"1","uploadLimit":"1","Button":true,"Checkbox":true,"TextBox":true,"TextArea":true,"Dropdown":true,"Radio":true,"Name":true,"Email":true,"Header":true,"FileUpload":true}'),
      ('4', 'Gold', '{"admin":false,"formLimit":"10","submissionLimit":"1","uploadLimit":"1","Button":true,"Checkbox":true,"TextBox":true,"TextArea":true,"Dropdown":true,"Radio":true,"Name":true,"Email":true,"Header":true,"FileUpload":true}'),
      ('5', 'Diamond', '{"admin":false,"formLimit":"10","submissionLimit":"1","uploadLimit":"1","Button":true,"Checkbox":true,"TextBox":true,"TextArea":true,"Dropdown":true,"Radio":true,"Name":true,"Email":true,"Header":true,"FileUpload":true}'),
      ('6', 'Daily', '{"admin":false,"formLimit":"10","submissionLimit":"1","uploadLimit":"1","Button":true,"Checkbox":true,"TextBox":true,"TextArea":true,"Dropdown":true,"Radio":true,"Name":true,"Email":true,"Header":true,"FileUpload":true}')
  `)
}