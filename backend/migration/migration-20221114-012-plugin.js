module.exports = async (db) => {
  await db.query(`
    INSERT INTO \`role\`
      (id, name, permission)
    VALUES
      ('10', 'BFSilver', '{"admin":false,"formLimit":"10","submissionLimit":"1","uploadLimit":"1","Button":true,"Checkbox":true,"TextBox":true,"TextArea":true,"Dropdown":true,"Radio":true,"Name":true,"Email":true,"Header":true,"FileUpload":true}'),
      ('11', 'BFGold', '{"admin":false,"formLimit":"10","submissionLimit":"1","uploadLimit":"1","Button":true,"Checkbox":true,"TextBox":true,"TextArea":true,"Dropdown":true,"Radio":true,"Name":true,"Email":true,"Header":true,"FileUpload":true}'),
      ('12', 'BFDiamond', '{"admin":false,"formLimit":"10","submissionLimit":"1","uploadLimit":"1","Button":true,"Checkbox":true,"TextBox":true,"TextArea":true,"Dropdown":true,"Radio":true,"Name":true,"Email":true,"Header":true,"FileUpload":true}')
  `)
}