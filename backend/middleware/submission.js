const path = require('path')
const sgMail = require('@sendgrid/mail')
const { getPool } = require(path.resolve('./', 'db'))

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = (app) => {
  // Handle form submission
  app.post('/form/submit/:id', async (req, res) => {
    const form_id = parseInt(req.params.id)

    const keys = Object.keys(req.body)
    const db = await getPool()

    //create submission and get id
    const result = await db.query(
      `INSERT INTO \`submission\`
        (form_id, created_at, updated_at)
      VALUES
        (?, NOW(), NOW())`,
      [form_id]
    )
    const submission_id = result.insertId

    for(const key of keys) {
      const question_id = parseInt(key.split('_')[1])
      const value = req.body[key]

      //save answer
      await db.query(
        `INSERT INTO \`entry\`
          (form_id, submission_id, question_id, value)
        VALUES
          (?, ?, ?, ?)`,
        [form_id, submission_id, question_id, value]
      )
    }

    res.send('Your Submission has been received')

    //read out form
    const formResult = await db.query(
      `SELECT * FROM \`form\`
      WHERE id = ?`,
      [form_id]
    )
    let sendEmailTo = false

    if (formResult.length > 0) {
      const form = formResult[0]

      form.props = JSON.parse(form.props)

      const integrations = form.props.integrations || []
      const emailIntegration = integrations.filter((integration) => (integration.type === 'email'))

      if (emailIntegration.length > 0) {
        sendEmailTo = emailIntegration[0].to
      }
    }

    if (sendEmailTo !== false) {
      const msg = {
        to: sendEmailTo,
        from: 'submission-notifications-noreply@api.formpress.org',
        subject: 'New submission has been received',
        text: `New Submission has been received ${JSON.stringify(req.body)}`,
        html: `New Submission has been received ${JSON.stringify(req.body)}`,
      }

      try {
        console.log('sending email ', msg)
        sgMail.send(msg)
      } catch (e) {
        console.log('Error while sending email ', e)
      }

    }
  })
}
