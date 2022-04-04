const path = require('path')
const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const devPort = 3000
const { FP_ENV, FP_HOST } = process.env
const { genRandomString, sha512 } = require(path.resolve('helper')).random
const { getPool } = require(path.resolve('./', 'db'))
const { error } = require(path.resolve('helper'))
const isEnvironmentVariableSet = {
  sendgridApiKey: process.env.SENDGRID_API_KEY !== ''
}
const FRONTEND = FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST

module.exports = (app) => {
  app.post('/api/users/signup', async (req, res) => {
    const { email, password } = req.body

    const db = await getPool()

    const result = await db.query(
      `
        SELECT *
        FROM \`user\`
        WHERE email = ?
      `,
      [email.toLowerCase()]
    )

    if (result.length === 0) {
      const verifyCode = genRandomString(128)
      const hash = sha512(password, genRandomString(128))
      const newEntry = await db.query(`
        INSERT INTO \`user\`
          (email, password, salt, emailVerificationCode)
        VALUES
      ('${email.toLowerCase()}', '${hash.passwordHash}', '${
        hash.salt
      }', '${verifyCode}')
      `)

      //adding default role 2, it should be dynamic
      await db.query(`
        INSERT INTO \`user_role\`
          (user_id, role_id)
        VALUES
        ('${newEntry.insertId}', '2')
      `)

      if (isEnvironmentVariableSet.sendgridApiKey == false) {
        await db.query(
          `
            UPDATE \`user\` SET \`emailVerified\` = 1 WHERE id = ?
          `,
          [newEntry.insertId]
        )
      }

      const htmlBody = await ejs
        .renderFile(
          path.join(__dirname, '../views/signupsuccesshtml.tpl.ejs'),
          {
            FRONTEND: FRONTEND,
            USERID: newEntry.insertId,
            VERIFYCODE: verifyCode
          }
        )
        .catch((err) => {
          console.log('can not render html body', err)
          error.errorReport(err)
        })

      const textBody = await ejs
        .renderFile(
          path.join(__dirname, '../views/signupsuccesstext.tpl.ejs'),
          {
            FRONTEND: FRONTEND,
            USERID: newEntry.insertId,
            VERIFYCODE: verifyCode
          }
        )
        .catch((err) => {
          console.log('can not render text body', err)
          error.errorReport(err)
        })

      const msg = {
        to: email,
        from: 'verify-account-noreply@api.formpress.org',
        subject: 'FORMPRESS Verify Account',
        text: textBody,
        html: htmlBody
      }

      if (isEnvironmentVariableSet.sendgridApiKey) {
        try {
          console.log('sending verification email ', msg)
          sgMail.send(msg)
        } catch (e) {
          console.log('Error while sending email ', e)
          error.errorReport(e)
        }
      }
      res.status(200).json({
        message: 'Signup Success'
      })
    } else {
      return res
        .status(403)
        .json({ message: 'This e-mail is already attached to an account' })
    }
  })
}
