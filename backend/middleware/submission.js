const path = require('path')
const fs = require('fs')
const sgMail = require('@sendgrid/mail')
const ejs = require('ejs')
const BACKEND = process.env.FE_BACKEND
const { getPool } = require(path.resolve('./', 'db'))
const {
  storage,
  submissionhandler,
  error,
  model,
  integrationhelper,
  recaptcha
} = require(path.resolve('helper'))

const { FormModel, FormPublishedModel } = model

const { validate: isStringUUID } = require('uuid')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)
const isEnvironmentVariableSet = {
  sendgridApiKey: process.env.SENDGRID_API_KEY !== ''
}

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
    let form_id = req.params.id
    let uuid
    let overrideTyPageId = req.query.tyPageId || false

    const formModel = new FormModel()
    const formPublishedModel = new FormPublishedModel()

    if (isStringUUID(form_id) === true) {
      uuid = form_id
      form_id = await formModel.getFormIdFromUUID(form_id)
    } else if (parseInt(form_id) > 1200) {
      return res.status(404).send('Form Not Found')
    } else {
      form_id = parseInt(form_id)
    }

    // Before even going further, check if honey pot is filled
    if (
      req.body.email ||
      req.body.website ||
      req.body.phone ||
      req.body.name ||
      req.body.company
    ) {
      // log the honey pot filled
      console.log(
        `Honey pot filled. IP: ${
          req.headers['x-forwarded-for'] || req.connection.remoteAddress
        }`
      )
      let otpQuery = `?otp=${1}`

      return res.redirect(`/form/submit/${uuid}${otpQuery}`)
    } else {
      // clear these from the request body
      delete req.body.email
      delete req.body.website
      delete req.body.phone
      delete req.body.name
      delete req.body.company
    }

    const regularForm = await formModel.get({ form_id })
    form_id = regularForm.id

    let version = parseInt(req.params.version) //either a value or NaN
    const db = await getPool()
    //if preview mode
    if (isNaN(version)) {
      version = 0
    }

    // preview form gets a short circuit
    if (version === 0) {
      let otpQuery = overrideTyPageId ? `?otp=${overrideTyPageId}` : ''
      return res.redirect(`/form/submit/${uuid}${otpQuery}`)
    }

    //read out form
    let formResult
    if (version === 0) {
      formResult = regularForm
    } else {
      formResult = await formPublishedModel.get({
        form_id,
        version_id: version
      })
    }

    if (formResult === false) {
      return res.status(404).send('Error: form not found')
    }

    const form = formResult
    //preview mode form id = form.id VS published mode form id = form.form_id

    const userResult = await db.query(
      `SELECT \`isActive\` FROM \`user\` WHERE \`id\` = ?`,
      [form.user_id]
    )

    if (userResult[0].isActive === 0) {
      return res.status(404).send('Error: Form not found')
    }

    //check if captcha is enabled in form
    const captcha = form.props.elements.find(
      (element) => element.type === 'CAPTCHA'
    )

    if (captcha !== undefined) {
      const token = req.body['g-recaptcha-response']
      const captchaResult = await recaptcha.verifyToken(token)

      if (captchaResult === false) {
        return res.status(403).send('Error: Invalid CAPTCHA')
      }
    }

    //create submission and get id
    const result = await db.query(
      `INSERT INTO \`submission\`
        (form_id, created_at, version, completion_time)
      VALUES
        (?, NOW(), ?, ?)`,
      [
        form_id,
        version,
        Math.floor(Date.now() / 1000) - parseInt(req.body.form_starting_time)
      ]
    )
    const submission_id = result.insertId

    const preformatInputs = []

    let keys = [...Object.keys(req.body)]

    // remove captcha response from keys
    keys = keys.filter((key) => key !== 'g-recaptcha-response')

    if (req.files !== null) {
      keys = [...keys, ...Object.keys(req.files)]
    }

    const fileUploadEntries = []

    for (const key of keys) {
      const question_id = parseInt(key.split('_')[1])
      const type = findQuestionType(form, question_id)
      let value

      //upload file to GCS
      if (type === 'FileUpload') {
        value = await storage.uploadFile(req.files[key], submission_id)
        fileUploadEntries.push(value)
      } else {
        value = req.body[key]

        if (key.includes('date')) {
          if (value.includes(' ')) {
            let time = value.split(' ')[1]
            value = value.split(' ')[0]

            preformatInputs.push({ q_id: key, value: value })
            preformatInputs.push({
              q_id: `q_${question_id}[time]`,
              value: time
            })

            continue
          }
        }
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
    } catch (err) {
      console.error('Error during submission')
      console.error(err)
      error.errorReport(err)

      res.status(500).send('Error during submission handling')
    }

    let fileUploadCounter = -1

    for (const key of keys) {
      const question_id = parseInt(key.split('_')[1])
      const type = findQuestionType(form, question_id)

      if (type === 'FileUpload') {
        fileUploadCounter++
        let parsedValue = ''

        parsedValue = JSON.parse(fileUploadEntries[fileUploadCounter])

        const entry_idData = await db.query(
          `SELECT \`id\` FROM \`entry\` WHERE submission_id = ? AND question_id = ?`,
          [submission_id, question_id]
        )

        const user_idData = await db.query(
          `SELECT \`user_id\` FROM \`form\` WHERE id = ?`,
          [form_id]
        )

        const fileSize = parsedValue[0].fileSize
        const uploadName = parsedValue[0].uploadName
        const user_id = user_idData[0].user_id
        const entry_id = entry_idData[0].id
        formattedInput.forEach((element) => {
          if (element.q_id === question_id) {
            element.entry_id = entry_id
          }
        })
        await db.query(
          `INSERT INTO \`storage_usage\`
            (user_id, form_id, submission_id, entry_id, upload_name, size, created_at)
          VALUES
            (?, ?, ?, ?, ?, ?, NOW())`,
          [user_id, form_id, submission_id, entry_id, uploadName, fileSize]
        )
      }
    }

    let sendEmailTo = []

    const integrations = form.props.integrations || []
    const emailIntegration = integrations.filter(
      (integration) => integration.type === 'email'
    )

    let submitBehaviour

    const submissionIntegration = form.props.integrations.find(
      (integration) => integration.type === 'submitBehaviour'
    )
    if (submissionIntegration) {
      submitBehaviour = submissionIntegration.value
    } else {
      submitBehaviour = 'Show Thank You Page'
    }
    //send override thank you page id with query if it exists
    let otpQuery = overrideTyPageId ? `?otp=${overrideTyPageId}` : ''

    switch (submitBehaviour) {
      case 'Evaluate Form':
        res.redirect(
          `/api/users/${form.user_id}/forms/${form_id}/submissions/${submission_id}/evaluate`
        )
        break
      case 'Show Thank You Page':
        res.redirect(`/form/submit/${uuid}${otpQuery}`)
        break
      default:
        res.redirect(`/form/submit/${uuid}${otpQuery}`)
        break
    }

    let pdfRequest = false
    const pdfIntegrations = ['GoogleDrive']

    const integrationList = form.props.integrations

    for (const integration of integrationList) {
      if (pdfIntegrations.includes(integration.type)) {
        if (integration.active) {
          pdfRequest = true
        }
      }
    }

    const questionsAndAnswers = submissionhandler.getQuestionsWithRenderedAnswers(
      form,
      formattedInput,
      submission_id,
      pdfRequest
    )

    if (emailIntegration.length > 0 && emailIntegration[0].to) {
      sendEmailTo = emailIntegration[0].to.split(',')
    }
    const FRONTEND = process.env.FE_FRONTEND
    if (
      sendEmailTo.length !== 0 &&
      isEnvironmentVariableSet.sendgridApiKey !== false
    ) {
      const htmlBody = await ejs
        .renderFile(path.join(__dirname, '../views/submitemailhtml.tpl.ejs'), {
          FRONTEND: FRONTEND,
          FormTitle: form.title,
          QUESTION_AND_ANSWERS: questionsAndAnswers,
          Submission_id: submission_id
        })
        .catch((err) => {
          console.log('can not render html body', err)
          error.errorReport(err)
        })

      const textBody = await ejs
        .renderFile(path.join(__dirname, '../views/submitemailtext.tpl.ejs'), {
          FRONTEND: FRONTEND,
          FormTitle: form.title,
          Form: form,
          FormattedInput: formattedInput,
          Submission_id: submission_id
        })
        .catch((err) => {
          console.log('can not render text body', err)
          error.errorReport(err)
        })

      const msg = {
        to: sendEmailTo.map((email) => ({ email: email.trim() })),
        from: {
          name: 'FormPress',
          email: `submission-notifications-noreply@api.${process.env.EMAIL_DOMAIN}`
        },
        subject: `New Response: ${form.title}`,
        text: textBody,
        html: htmlBody
      }
      //add custom email subject if written
      if (
        emailIntegration[0].subject !== '' &&
        emailIntegration[0].subject !== undefined
      ) {
        msg.subject = emailIntegration[0].subject
          .split('{FormTitle}')
          .join(form.title)
      }

      const validEmail = (email) => {
        return email.trim().indexOf('@') > -1 && email.length > 3
      }
      //custom reply to
      if (
        emailIntegration[0].replyTo !== undefined &&
        emailIntegration[0].replyTo === 'custom'
      ) {
        if (
          emailIntegration[0].replyToCustom &&
          validEmail(emailIntegration[0].replyToCustom)
        )
          msg.replyTo = emailIntegration[0].replyToCustom.split(' ').join('')
      } else if (
        emailIntegration[0].replyTo !== undefined &&
        emailIntegration[0].replyTo !== 'none'
      ) {
        //it means dynamic reply to
        const emailAnswerId = parseInt(emailIntegration[0].replyTo)
        const emailQuestion = form.props.elements.filter(
          (element) => element.id === emailAnswerId
        )
        if (emailQuestion.length > 0 && emailQuestion[0].type === 'Email') {
          const emailAnswer = formattedInput.filter(
            (answer) => answer.q_id === emailAnswerId
          )
          if (emailAnswer.length > 0 && validEmail(emailAnswer[0].value)) {
            msg.replyTo = emailAnswer[0].value.split(' ').join('')
          }
        }
      }

      try {
        console.log('sending email')
        await sgMail.send(msg, sendEmailTo.length > 1) // second argument is for isMultiple
      } catch (e) {
        console.log('Error while sending email ', e)
      }
    }

    //add submission_usage
    if (version !== 0) {
      const dateObj = new Date()
      const month = dateObj.getUTCMonth() + 1 //months from 1-12
      const year = dateObj.getUTCFullYear()
      const yearMonth = year + '-' + month
      const formOwnerResult = await db.query(
        `SELECT \`user_id\` FROM \`form_published\` WHERE form_id = ? AND version = ?`,
        [form_id, version]
      )
      const formOwner = formOwnerResult[0].user_id
      const checkUsageResult = await db.query(
        `
        SELECT * FROM \`submission_usage\` WHERE user_id = ? AND date = ?`,
        [formOwner, yearMonth]
      )

      if (checkUsageResult.length === 0) {
        await db.query(
          `
          INSERT INTO \`submission_usage\`
            (user_id, date, count)
          VALUES
            (?,?,1)
          `,
          [formOwner, yearMonth]
        )
      } else {
        await db.query(
          `
        UPDATE \`submission_usage\` SET count = count + 1 WHERE user_id = ? AND date = ?
        `,
          [formOwner, yearMonth]
        )
      }
    }

    await integrationhelper.triggerIntegrations(
      form,
      questionsAndAnswers,
      submission_id
    )
  })

  app.get('/form/submit/:uuid', async (req, res) => {
    let uuid = req.params.uuid

    const formModel = new FormModel()
    const formPublishedModel = new FormPublishedModel()

    let form_id = await formModel.getFormIdFromUUID(uuid)
    let overrideTyPageId = req.query.otp || false

    const db = await getPool()

    const regularForm = await formModel.get({ form_id })
    let version = regularForm.published_version || 0

    //read out form
    let publishedForm
    if (version === 0) {
      publishedForm = regularForm
    } else {
      publishedForm = await formPublishedModel.get({
        form_id,
        version_id: version
      })
    }

    if (publishedForm === false) {
      return res.status(404).send('Error: form not found')
    }

    const form = publishedForm
    //preview mode form id = form.id VS published mode form id = form.form_id

    const userResult = await db.query(
      `SELECT \`isActive\` FROM \`user\` WHERE \`id\` = ?`,
      [form.user_id]
    )

    if (userResult[0].isActive === 0) {
      return res.status(404).send('Error: Form not found')
    }

    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/thankyou.css')
    )

    let tyPageTitle = 'Thank you!'

    let tyPageText = ''
    if (isEnvironmentVariableSet.sendgridApiKey) {
      tyPageText =
        'Your submission was successful and the form owner has been notified.'
    } else {
      tyPageText = 'Your submission was successful.'
    }

    let thankYouIntegrationCount_LEGACY = 0

    const integrations = form.props.integrations || []
    const tyTitleIntegration = integrations.filter(
      (integration) => integration.type === 'tyPageTitle'
    )

    if (
      tyTitleIntegration.length > 0 &&
      tyTitleIntegration[0].value.length > 0
    ) {
      tyPageTitle = tyTitleIntegration[0].value
      thankYouIntegrationCount_LEGACY++
    }

    const tyTextIntegration = integrations.filter(
      (integration) => integration.type === 'tyPageText'
    )

    if (tyTextIntegration.length > 0 && tyTextIntegration[0].value.length > 0) {
      tyPageText = tyTextIntegration[0].value
      thankYouIntegrationCount_LEGACY++
    }

    const tyPageIdIntegration = form.props.integrations.find(
      (integration) => integration.type === 'tyPageId'
    )

    if (
      thankYouIntegrationCount_LEGACY > 0 &&
      tyPageIdIntegration === undefined
    ) {
      // support for legacy thank you page integration
      return res.render('submit-success.tpl-LEGACY.ejs', {
        headerAppend: `<style type='text/css'>${style}</style>`,
        tyTitle: tyPageTitle,
        tyText: tyPageText,
        BACKEND,
        UUID: uuid
      })
    } else {
      let tyPageId

      if (tyPageIdIntegration !== undefined) {
        tyPageId = tyPageIdIntegration.value
      } else {
        tyPageId = 1
      }

      if (overrideTyPageId !== false) {
        tyPageId = parseInt(overrideTyPageId)
      }

      const dbResult = await db.query(
        `SELECT * FROM \`custom_thank_you\` WHERE user_id = ? AND id = ? OR id = 1`,
        [form.user_id, tyPageId]
      )

      if (dbResult.length > 0) {
        const customThankYou = dbResult.find((item) => item.id === tyPageId)
        const defaultThankYou = dbResult.find((item) => item.id === 1)

        let html
        if (customThankYou) {
          html = customThankYou.html
        } else {
          html = defaultThankYou.html
        }

        if (html === undefined || html === null) {
          console.error(
            'Html is undefined or null',
            `User ID: ${form.user_id}`,
            `Form ID: ${form_id}`
          )
          html = ''
        }

        const userRoleResult = await db.query(
          `SELECT \`role_id\` FROM \`user_role\` WHERE \`user_id\` = ?`,
          [form.user_id]
        )

        let showBranding = false

        if (userRoleResult[0].role_id === 2) {
          showBranding = true
        }

        return res.render('submit-success.tpl.ejs', {
          headerAppend: `<style type='text/css'>${style}</style>`,
          htmlContent: html,
          showBranding: showBranding,
          BACKEND,
          UUID: uuid
        })
      }
    }
  })

  app.post('/templates/submit/:id', async (req, res) => {
    let style = fs.readFileSync(
      path.resolve('../', 'frontend/src/style/normalize.css')
    )

    style += fs.readFileSync(
      path.resolve('../', 'frontend/src/style/thankyou.css')
    )

    let tyPageTitle = 'Thank you!'
    let tyPageText =
      'Your submission was successful and the form owner has been notified.'

    res.render('submit-success.tpl-LEGACY.ejs', {
      headerAppend: `<style type='text/css'>${style}</style>`,
      tyTitle: tyPageTitle,
      tyText: tyPageText
    })
  })
}
