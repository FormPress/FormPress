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

  let selectedQnA = []
  if (chosenInputElems === 'all' || chosenInputElems === undefined) {
    selectedQnA = [...questionsAndAnswers]
  } else {
    chosenInputElems.forEach((elem) => {
      const foundQnA = questionsAndAnswers.find((QnA) => QnA.id === elem.id)
      if (foundQnA !== undefined) {
        selectedQnA.push(foundQnA)
      }
    })
  }

  //Puts questions in order, without this function selecting and deselecting items breaks the question order.
  selectedQnA.sort((a, b) => {
    return a.id - b.id
  })

  const entries = selectedQnA.map((QnA) => {
    const entry = {}
    entry.question = QnA.question
    entry.answer = QnA.answer
    return entry
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
    entries
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
