const path = require('path')
const sgMail = require('@sendgrid/mail')
const { getPool } = require(path.resolve('./', 'db'))
const { fileupload } = require(path.resolve('helper'))

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const findQuestionType = (form, qid) => {
  for (const elem of form.props.elements) {
    if (elem.id === qid) {
      return elem.type
    }
  }

  return false
}

module.exports = (app) => {
  // Handle form submission
  app.post('/form/submit/:id', async (req, res) => {
    const form_id = parseInt(req.params.id)
    const keys = [...Object.keys(req.body), ...Object.keys(req.files)]
    const db = await getPool()

    //read out form
    const formResult = await db.query(
      `SELECT * FROM \`form\`
      WHERE id = ?`,
      [form_id]
    )

    if (formResult.length === 0) {
      return req.status(404).send('Error: form not found')
    }

    const form = formResult[0]

    form.props = JSON.parse(form.props)

    //create submission and get id
    const result = await db.query(
      `INSERT INTO \`submission\`
        (form_id, created_at, updated_at)
      VALUES
        (?, NOW(), NOW())`,
      [form_id]
    )
    const submission_id = result.insertId

    for (const key of keys) {
      const question_id = parseInt(key.split('_')[1])
      const type = findQuestionType(form, question_id)
      let value

      //upload file to GCS
      if (type === 'FileUpload') {
        value = await fileupload.uploadFile(req.files[key])
      } else {
        value = req.body[key]
      }

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

    let sendEmailTo = false
    const integrations = form.props.integrations || []
    const emailIntegration = integrations.filter(
      (integration) => integration.type === 'email'
    )

    if (emailIntegration.length > 0) {
      sendEmailTo = emailIntegration[0].to
    }

    if (sendEmailTo !== false) {
      const msg = {
        to: sendEmailTo,
        from: 'submission-notifications-noreply@api.formpress.org',
        subject: 'New submission has been received',
        text: `New Submission has been received ${JSON.stringify(req.body)}`,
        html: `New Submission has been received ${JSON.stringify(req.body)}`,
      }

      sgMail.send(msg)
    }
  })
}
