const { IncomingWebhook } = require('@slack/webhook')

const { error } = require('../helper')

const blockGenerator = (QnA, title) => {
  //Initialize block with header
  let blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `New Response: ${title}`
      }
    },
    {
      type: 'divider'
    }
  ]
  //Add form data
  QnA.forEach((currentQnA) => {
    let questionField = {
      type: 'header',
      text: {
        type: 'plain_text',
        text: currentQnA.question
      }
    }
    let answerField = {
      type: 'section',
      text: {
        type: 'plain_text',
        text: currentQnA.answer
      }
    }

    blocks.push(questionField, answerField)
  })

  //ADD FOOTER
  blocks.push(
    {
      type: 'divider'
    },
    {
      type: 'context',
      elements: [
        {
          type: 'image',
          image_url:
            'https://storage.googleapis.com/static.formpress.org/images/logo-whiteBG-512x512.png',
          alt_text: 'formpress logo'
        },
        {
          type: 'mrkdwn',
          text: 'Copyright © 2022 *FormPress*'
        }
      ]
    }
  )
  return blocks
}

exports.triggerWebhook = async ({
  integrationConfig,
  questionsAndAnswers,
  formTitle
}) => {
  const url = integrationConfig.value
  const chosenInputElems = integrationConfig.chosenInputs

  const selectedQnA = []
  chosenInputElems.forEach((elem) => {
    const foundQnA = questionsAndAnswers.find((QnA) => QnA.id === elem.id)
    if (foundQnA !== undefined) {
      selectedQnA.push(foundQnA)
    }
  })

  const blocks = blockGenerator(selectedQnA, formTitle)

  try {
    const webhook = new IncomingWebhook(url)

    await webhook.send({
      blocks: blocks
    })
  } catch (err) {
    console.log('Could not send slack webhook', err)
    error.errorReport(err)
  }
}

exports.slackApi = (app) => {
  app.post('/api/slack/init', async (req, res) => {
    const { url, formTitle } = req.body

    const activationMessage = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Now Active for form ${formTitle}!`
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'context',
        elements: [
          {
            type: 'image',
            image_url:
              'https://storage.googleapis.com/static.formpress.org/images/logo-whiteBG-512x512.png',
            alt_text: 'formpress logo'
          },
          {
            type: 'mrkdwn',
            text: 'Copyright © 2022 *FormPress*'
          }
        ]
      }
    ]

    try {
      const webhook = new IncomingWebhook(url)

      await webhook.send({
        blocks: activationMessage
      })
      return res.status(200).json({ message: 'connection established' })
    } catch (err) {
      return res.status(400).json({ message: 'cannot create webhook client' })
    }
  })
}
