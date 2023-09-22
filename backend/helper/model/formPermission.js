const path = require('path')
const { getPool } = require(path.resolve('./', 'db'))
const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const { error } = require(path.resolve('helper'))
sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const { FP_ENV, FP_HOST } = process.env
const devPort = 3000

const hydrate = (raw) => {
  const ret = { ...raw }

  ret.permissions = JSON.parse(ret.permissions || '[]')

  return ret
}

const sendNotificationEmail = async ({
  target_user_email,
  source_user_email,
  formTitle,
  form_id,
  permissions,
  id
}) => {
  const FRONTEND = FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST
  const htmlBody = await ejs
    .renderFile(
      path.join(__dirname, '../../views/formshareinvitationhtml.tpl.ejs'),
      {
        FRONTEND,
        sourceUserEmail: source_user_email,
        formTitle,
        form_id,
        permissions,
        id
      }
    )
    .catch((err) => {
      console.log('can not render html body', err)
      error.errorReport(err)
    })

  const textBody = await ejs
    .renderFile(
      path.join(__dirname, '../../views/formshareinvitationtext.tpl.ejs'),
      {
        FRONTEND,
        sourceUserEmail: source_user_email,
        formTitle,
        form_id,
        permissions,
        id
      }
    )
    .catch((err) => {
      console.log('can not render text body', err)
      error.errorReport(err)
    })

  const msg = {
    to: target_user_email,
    from: {
      name: 'FormPress',
      email: `formpress-notifications@api.${process.env.EMAIL_DOMAIN}`
    },
    subject: `${source_user_email} has invited you to their form: ${formTitle}`,
    html: htmlBody,
    text: textBody
  }
  try {
    console.log('sending formshare invitation email')
    await sgMail.send(msg)
  } catch (e) {
    console.log('Error while sending formshare invitation email ', e)
  }
}

const TABLE_NAME = 'form_permission'

exports.list = async ({ form_id }) => {
  const db = await getPool()
  const result = await db.query(
    `
    SELECT *
    FROM \`${TABLE_NAME}\`
    WHERE form_id = ?
  `,
    [form_id]
  )
  if (result.length === 0) {
    return []
  }

  return result.map(hydrate)
}

/*
  Permissions are in the form
  {
    READ: true, // User can open the form in form builder, see everything, but can't update the form
    DATA: true, // User can see submissions in /data page
    EDIT: true // User can view the form in form builder and edit it as if he/she owns it
  }

  Note: deletion currently won't be allowed
*/

exports.get = async ({ id }) => {
  const db = await getPool()
  const result = await db.query(
    `
    SELECT *
    FROM \`${TABLE_NAME}\`
    WHERE id = ?
  `,
    [id]
  )

  if (result.length === 0) {
    return false
  }

  return hydrate(result[0])
}

exports.create = async ({
  user,
  user_id,
  form_id,
  permissions,
  target_user_email
}) => {
  const db = await getPool()

  const result = await db.query(
    `
    INSERT INTO \`${TABLE_NAME}\`
      (user_id, form_id, permissions, target_user_email)
    VALUES
      (?, ?, ?, ?)
  `,
    [user_id, form_id, JSON.stringify(permissions), target_user_email]
  )

  const formResult = await db.query('SELECT `title` from `form` WHERE id = ?', [
    form_id
  ])

  if (formResult.length === 0) {
    console.log(
      `Form with id ${form_id} can't be found during form share permission creation`
    )
    return
  }

  const formTitle = formResult[0].title

  await sendNotificationEmail({
    target_user_email,
    source_user_email: user.email,
    formTitle,
    form_id,
    permissions: Object.keys(permissions),
    id: result.insertId
  })
}

/*
  Only parts that are allowed to be updated are, permissions, and target_user_id

  one must send correct id
*/
exports.updatePermissions = async ({ id, permissions }) => {
  const db = await getPool()

  return await db.query(
    ` UPDATE \`${TABLE_NAME}\`
        SET permissions = ?
      WHERE
        id = ?
    `,
    [JSON.stringify(permissions), id]
  )
}

exports.accept = async ({ id, target_user_id, target_user_email }) => {
  const db = await getPool()
  const result = await db.query(
    `SELECT target_user_email
      FROM \`${TABLE_NAME}\`
      WHERE id = ?
    `,
    [id]
  )
  if (result.length > 0 && result[0].target_user_email === target_user_email) {
    return await db.query(
      ` UPDATE \`${TABLE_NAME}\`
          SET target_user_id = ?
        WHERE
          id = ?
      `,
      [target_user_id, id]
    )
  } else {
    throw new Error('Emails do not match')
  }
}
exports.delete = async ({ id }) => {
  const db = await getPool()
  return await db.query(
    `
    DELETE FROM \`${TABLE_NAME}\` WHERE id = ? LIMIT 1
  `,
    [id]
  )
}
