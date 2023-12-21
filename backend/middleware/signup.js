const path = require('path')
const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const devPort = 3000
const { FP_ENV, FP_HOST } = process.env
const { genRandomString, sha512 } = require(path.resolve('helper')).random
const { getPool } = require(path.resolve('./', 'db'))
const { error } = require(path.resolve('helper'))
const { model } = require(path.resolve('helper'))
const userModel = model.user

const isEnvironmentVariableSet = {
  sendgridApiKey: process.env.SENDGRID_API_KEY !== ''
}
const FRONTEND = FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST
const { locationFinder } = require(path.resolve('helper')).cfLocationFinder

module.exports = (app) => {
  app.post('/api/users/signup', async (req, res) => {
    const { email, password, isCodeBasedSignUp } = req.body

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
      let verifyCode

      // Determine the length of the verification code based on the sign-up method
      const verificationCodeLength = isCodeBasedSignUp ? 6 : 128

      // Generate a random string for the verification code
      verifyCode = genRandomString(verificationCodeLength)

      const hash = sha512(password, genRandomString(128))
      const newEntry = await db.query(`
        INSERT INTO \`user\`
          (email, password, salt, emailVerificationCode)
        VALUES
      ('${email.toLowerCase()}', '${hash.passwordHash}', '${
        hash.salt
      }', '${verifyCode}')
      `)

      const user_id = newEntry.insertId

      //adding default role 2, it should be dynamic
      await db.query(`
        INSERT INTO \`user_role\`
          (user_id, role_id)
        VALUES
        ('${user_id}', '2')
      `)

      await locationFinder(user_id, req.get('cf-ipcountry'))

      if (isEnvironmentVariableSet.sendgridApiKey == false) {
        await db.query(
          `
            UPDATE \`user\` SET \`emailVerified\` = 1 WHERE id = ?
          `,
          [user_id]
        )
      }

      let htmlBody, textBody

      if (isCodeBasedSignUp) {
        // Six digit code based verification
        htmlBody = await ejs.renderFile(
          path.join(__dirname, '../views/signupsuccesscodehtml.tpl.ejs'),
          {
            VERIFYCODE: verifyCode
          }
        )

        textBody = await ejs.renderFile(
          path.join(__dirname, '../views/signupsuccesscodetext.tpl.ejs'),
          {
            VERIFYCODE: verifyCode
          }
        )
      } else {
        // Good old email verification via link
        htmlBody = await ejs
          .renderFile(
            path.join(__dirname, '../views/signupsuccesshtml.tpl.ejs'),
            {
              FRONTEND: FRONTEND,
              USERID: user_id,
              VERIFYCODE: verifyCode
            }
          )
          .catch((err) => {
            console.log('can not render html body', err)
            error.errorReport(err)
          })

        textBody = await ejs
          .renderFile(
            path.join(__dirname, '../views/signupsuccesstext.tpl.ejs'),
            {
              FRONTEND: FRONTEND,
              USERID: user_id,
              VERIFYCODE: verifyCode
            }
          )
          .catch((err) => {
            console.log('can not render text body', err)
            error.errorReport(err)
          })
      }

      const msg = {
        to: email,
        from: `verify-account-noreply@api.${process.env.EMAIL_DOMAIN}`,
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

      const user = await userModel.get({ user_id })

      return res.status(200).json({
        user,
        message: 'Signup Success'
      })
    } else {
      return res
        .status(403)
        .json({ message: 'This e-mail is already attached to an account' })
    }
  })

  app.get('/api/users/:user_id/resendVerificationCode', async (req, res) => {
    const { user_id } = req.params
    const db = await getPool()

    const result = await db.query(
      `
        SELECT \`email\`, \`emailVerificationCode\` FROM \`user\` WHERE id = ? AND emailVerified = 0
        `,
      [user_id]
    )

    if (result.length === 0) {
      return res.status(403).json({ message: 'User not found.' })
    }

    const dbVerificationCode = result[0].emailVerificationCode

    if (dbVerificationCode && dbVerificationCode.length !== 6) {
      return res.status(403).json({ message: 'Invalid verification code.' })
    }

    const email = result[0].email

    let verifyCode = genRandomString(6)

    await db.query(
      `
            UPDATE \`user\` SET \`emailVerificationCode\` = ? WHERE id = ?
          `,
      [verifyCode, user_id]
    )

    let htmlBody, textBody

    htmlBody = await ejs.renderFile(
      path.join(__dirname, '../views/signupsuccesscodehtml.tpl.ejs'),
      {
        VERIFYCODE: verifyCode
      }
    )

    textBody = await ejs.renderFile(
      path.join(__dirname, '../views/signupsuccesscodetext.tpl.ejs'),
      {
        VERIFYCODE: verifyCode
      }
    )

    const msg = {
      to: email,
      from: `verify-account-noreply@api.${process.env.EMAIL_DOMAIN}`,
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

    return res.status(200).json({ message: 'Verification code sent!' })
  })
}
