const path = require('path')
const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const devPort = 3000
const { FP_ENV, FP_HOST } = process.env

const { genRandomString } = require(path.resolve('helper')).random

const { getPool } = require(path.resolve('./', 'db'))

const FRONTEND = FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST

module.exports = (app) => {
  app.post('/api/users/forgotpassword', async (req, res) => {
    const { email } = req.body
    const db = await getPool()

    const result = await db.query(
      `
        SELECT *
        FROM \`user\`
        WHERE email = ?
      `,
      [email]
    )

    if (result.length === 0) {
      return res.status(403).json({ message: 'User not found.' })
    } else {
      const user_id = result[0].id
      const passwordResetCode = genRandomString(128)
      const expireDate = new Date()
      expireDate.setDate(expireDate.getDate() + 1)
      const expireDateForDB = expireDate
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')

      await db.query(
        `
          UPDATE \`user\`
          SET passwordResetCode = ?, passwordResetCodeExpireAt = ?
          WHERE id = ?
        `,
        [passwordResetCode, expireDateForDB, user_id]
      )

      const htmlBody = await ejs
        .renderFile(
          path.join(__dirname, '../views/forgotpasswordhtml.tpl.ejs'),
          {
            FRONTEND: FRONTEND,
            USERID: user_id,
            PASSWORDRESETCODE: passwordResetCode
          }
        )
        .catch((err) => {
          console.log('can not render html body', err)
        })

      const textBody = await ejs
        .renderFile(
          path.join(__dirname, '../views/forgotpasswordtext.tpl.ejs'),
          {
            FRONTEND: FRONTEND,
            USERID: user_id,
            PASSWORDRESETCODE: passwordResetCode
          }
        )
        .catch((err) => {
          console.log('can not render text body', err)
        })

      const msg = {
        to: email,
        from: 'password-reset-noreply@api.formpress.org',
        subject: 'FORMPRESS Password Reset',
        text: textBody,
        html: htmlBody
      }

      try {
        console.log('sending reset password email ', msg)
        sgMail.send(msg)
      } catch (e) {
        console.log('Error while sending reset password email ', e)
      }

      res.status(200).json({
        message: 'Success'
      })
    }
  })
}
