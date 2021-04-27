const path = require('path')
const fs = require('fs')
const sgMail = require('@sendgrid/mail')
const { getPool } = require(path.resolve('./', 'db'))
const { fileupload, submissionhandler } = require(path.resolve('helper'))

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
  app.post('/form/submit/:id/:version?', async (req, res) => {
    const form_id = parseInt(req.params.id)
    let version = parseInt(req.params.version) //either a value or NaN
    const db = await getPool()
    //if preview mode
    if (isNaN(version)) {
      version = 0
    }
    //read out form
    let formResult
    if (version === 0) {
      formResult = await db.query(
        `SELECT * FROM \`form\`
        WHERE id = ?`,
        [form_id]
      )
    } else {
      formResult = await db.query(
        `SELECT * FROM \`form_published\` WHERE form_id = ? AND version = ?`,
        [form_id, version]
      )
    }

    if (formResult.length === 0) {
      return res.status(404).send('Error: form not found')
    }

    const form = formResult[0]
    //preview mode form id = form.id VS published mode form id = form.form_id

    form.props = JSON.parse(form.props)

    //create submission and get id
    const result = await db.query(
      `INSERT INTO \`submission\`
        (form_id, created_at, updated_at, version)
      VALUES
        (?, NOW(), NOW(),?)`,
      [form_id, version]
    )
    const submission_id = result.insertId

    const preformatInputs = []

    let keys = [...Object.keys(req.body)]

    if (req.files !== null) {
      keys = [...keys, ...Object.keys(req.files)]
    }
    for (const key of keys) {
      const question_id = parseInt(key.split('_')[1])
      const type = findQuestionType(form, question_id)
      let value

      //upload file to GCS
      if (type === 'FileUpload') {
        value = await fileupload.uploadFile(req.files[key], submission_id)
      } else {
        value = req.body[key]
      }
      preformatInputs.push({ q_id: key, value: value })
    }
    const formattedInput = submissionhandler.formatInput(
      form.props.elements,
      preformatInputs
    )
    try {
      for (const data of formattedInput) {
        //save answer
        const question_id = parseInt(data.q_id)
        let value = data.value
        if (typeof value !== 'string') {
          value = JSON.stringify(value)
        }
        await db.query(
          `INSERT INTO \`entry\`
            (form_id, submission_id, question_id, value)
          VALUES
            (?, ?, ?, ?)`,
          [form_id, submission_id, question_id, value]
        )
      }
    } catch (error) {
      console.error('Error during submission')
      console.error(error)

      res.status(500).send('Error during submission handling')
    }
    //res.send('Your Submission has been received')

    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/thankyou.css')
    )

    let tyPageTitle = 'Thank you!'

    let tyPageText =
      'Your submission has been successfully sent and we informed the form owner about your submission.'

    let sendEmailTo = false
    const integrations = form.props.integrations || []
    const emailIntegration = integrations.filter(
      (integration) => integration.type === 'email'
    )

    const tyTitleIntegration = integrations.filter(
      (integration) => integration.type === 'tyPageTitle'
    )

    if (
      tyTitleIntegration.length > 0 &&
      tyTitleIntegration[0].value.length > 0
    ) {
      tyPageTitle = tyTitleIntegration[0].value
    }

    const tyTextIntegration = integrations.filter(
      (integration) => integration.type === 'tyPageText'
    )

    if (tyTextIntegration.length > 0 && tyTextIntegration[0].value.length > 0) {
      tyPageText = tyTextIntegration[0].value
    }

    res.render('submit-success.tpl.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      tyTitle: tyPageTitle,
      tyText: tyPageText
    })

    if (emailIntegration.length > 0) {
      sendEmailTo = emailIntegration[0].to
    }

    if (
      sendEmailTo !== false &&
      sendEmailTo !== undefined &&
      sendEmailTo !== ''
    ) {
      const msg = {
        to: sendEmailTo,
        from: 'submission-notifications-noreply@api.formpress.org',
        subject: 'New submission has been received',
        text: `New Submission has been received ${JSON.stringify(
          formattedInput
        )}`,
        html: `New Submission has been received ${JSON.stringify(
          formattedInput
        )}`
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
