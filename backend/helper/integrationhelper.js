const ejs = require('ejs')
const path = require('path')
const fs = require('fs')
const os = require('os')
const { FP_ENV, FP_HOST } = process.env
const devPort = 3000
const FRONTEND = FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST
const { error, pdfPrinter } = require(path.resolve('helper'))
const { replaceWithAnswers } = require(path.resolve('helper', 'stringTools'))

const { gdUploadFile } = require(
  path.resolve('integrations', 'googledriveapi.js')
)
const { appendData } = require(
  path.resolve('integrations', 'googlesheetsapi.js')
)
const { triggerDiscordWebhook } = require(
  path.resolve('integrations', 'discordapi.js')
)
const { triggerSlackWebhook } = require(
  path.resolve('integrations', 'slackapi.js')
)
const { triggerCustomWebhook } = require(
  path.resolve('integrations', 'customwebhookapi.js')
)

exports.triggerIntegrations = async (
  form,
  questionsAndAnswers,
  submission_id
) => {
  let pdfBuffer
  let customSubmissionFileName = ''
  const appPrefix = 'formpress-'
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix))
  const integrationList = form.props.integrations

  const gDrive = integrationList.find((i) => i.type === 'GoogleDrive')
  if (
    gDrive !== undefined &&
    gDrive.active === true &&
    gDrive.paused !== true
  ) {
    const { targetFolder, submissionIdentifier } = gDrive
    const { googleCredentials } = gDrive.value

    const htmlBody = await ejs
      .renderFile(
        path.join(__dirname, '../views/submitintegrationhtml.tpl.ejs'),
        {
          FRONTEND: FRONTEND,
          FormTitle: form.title,
          QUESTION_AND_ANSWERS: questionsAndAnswers,
          Submission_id: submission_id
        }
      )
      .catch((err) => {
        console.log('can not render html body', err)
        error.errorReport(err)
      })

    customSubmissionFileName = replaceWithAnswers(
      submissionIdentifier,
      questionsAndAnswers
    )

    const htmlPath = path.join(tmpDir, `${submission_id}.html`)

    fs.writeFileSync(htmlPath, htmlBody)

    const pdf = await pdfPrinter.generatePDF(htmlPath)
    pdfBuffer = Buffer.from(pdf)

    try {
      await gdUploadFile(
        targetFolder,
        pdfBuffer,
        customSubmissionFileName,
        googleCredentials
      )
    } catch (err) {
      error.errorReport(err)

      console.log('Error while uploading file to google drive', err)
    }
  }

  const gSheets = integrationList.find((i) => i.type === 'GoogleSheets')
  if (
    gSheets !== undefined &&
    gSheets.active === true &&
    gSheets.paused !== true
  ) {
    await appendData({
      integrationConfig: gSheets,
      questionsAndAnswers
    })
  }

  const discordWebhook = integrationList.find((i) => i.type === 'Discord')
  if (
    discordWebhook !== undefined &&
    discordWebhook.active === true &&
    discordWebhook.paused !== true
  ) {
    await triggerDiscordWebhook({
      integrationConfig: discordWebhook,
      questionsAndAnswers,
      formTitle: form.title
    })
  }

  const slackWebhook = integrationList.find((i) => i.type === 'Slack')
  if (
    slackWebhook !== undefined &&
    slackWebhook.active === true &&
    slackWebhook.paused !== true
  ) {
    await triggerSlackWebhook({
      integrationConfig: slackWebhook,
      questionsAndAnswers,
      formTitle: form.title
    })
  }

  // As of January 2024, all webhooks created by Form Webhooks API (including Zapier) are now "Webhook" which have the same structure as CustomWebhooks.
  const customWebhooks = integrationList.filter(
    (i) =>
      i.type === 'Webhook' || i.type === 'CustomWebhook' || i.type === 'Zapier' // Zapier is for backwards compatibility
  )
  if (customWebhooks.length > 0) {
    for (const webhook of customWebhooks) {
      if (
        webhook !== undefined &&
        webhook.active === true &&
        webhook.paused !== true
      ) {
        await triggerCustomWebhook({
          integrationConfig: webhook,
          questionsAndAnswers,
          formTitle: form.title,
          formId: form.id,
          submissionId: submission_id
        })
      }
    }
  }
}
