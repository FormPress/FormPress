const fetch = require('node-fetch')
const { error } = require('../helper')
const moment = require('moment/moment')

exports.triggerCustomWebhook = async ({
  integrationConfig,
  questionsAndAnswers,
  formTitle,
  formId,
  submissionId
}) => {
  const chosenInputElems = integrationConfig.chosenInputs

  const selectedQnA = []
  chosenInputElems.forEach((elem) => {
    const foundQnA = questionsAndAnswers.find((QnA) => QnA.id === elem.id)
    if (foundQnA !== undefined) {
      selectedQnA.push(foundQnA)
    }
  })

  //Puts questions in order, without this function selecting and deselecting items breaks the question order.
  selectedQnA.sort((a, b) => {
    return a.id - b.id
  })

  const submissions = selectedQnA.map((QnA) => {
    const submission = {}
    submission.question = QnA.question
    submission.answer = QnA.answer
    return submission
  })

  const webhookUrl = integrationConfig.value
  const submissionDate =
    moment(new Date()).utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC'
  const payload = {
    metadata: {
      formId,
      submissionId,
      formTitle,
      submissionDate
    },
    submissions
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
  } catch (err) {
    console.log('Could not send custom-webhook', err)
    error.errorReport(err)
  }
}
