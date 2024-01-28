const { IncomingWebhook } = require('@slack/webhook')

const { error } = require('../helper')
const YEAR = new Date().getFullYear()

const blockGenerator = (QnA, title, index, length) => {
  if (title.length > 130) {
    title = title.substring(0, 130) + '...'
  }
  let block = []
  //SINGLE BLOCK
  if (length === 1) {
    //ADD HEADER
    block.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: `New Response: ${title}`
      }
    })

    //Add form data
    QnA.forEach((currentQnA) => {
      let questionField = {
        type: 'header',
        text: {
          type: 'plain_text',
          text:
            currentQnA.question.length > 140
              ? currentQnA.question.substring(0, 140) + '...'
              : currentQnA.question
        }
      }
      let answerField = {
        type: 'section',
        text: {
          type: 'plain_text',
          text:
            currentQnA.answer.length > 2048
              ? currentQnA.answer.substring(0, 2048) + '...'
              : currentQnA.answer
        }
      }

      block.push(questionField, answerField)
    })

    //ADD FOOTER
    block.push(
      {
        type: 'context',
        elements: [
          {
            type: 'image',
            image_url:
              'https://static.formpress.org/images/logo-whiteBG-512x512.png',
            alt_text: 'formpress logo'
          },
          {
            type: 'mrkdwn',
            text: `${index + 1}/${length} Copyright © ${YEAR} *FormPress*`
          }
        ]
      },
      {
        type: 'divider'
      }
    )
    //MULTIPLE BLOCKS
  } else {
    if (index === 0) {
      //ADD HEADER
      block.push({
        type: 'header',
        text: {
          type: 'plain_text',
          text: `New Response: ${title}`
        }
      })

      //Add form data
      QnA.forEach((currentQnA) => {
        let questionField = {
          type: 'header',
          text: {
            type: 'plain_text',
            text:
              currentQnA.question.length > 140
                ? currentQnA.question.substring(0, 140) + '...'
                : currentQnA.question
          }
        }
        let answerField = {
          type: 'section',
          text: {
            type: 'plain_text',
            text:
              currentQnA.answer.length > 2048
                ? currentQnA.answer.substring(0, 2048) + '...'
                : currentQnA.answer
          }
        }

        block.push(questionField, answerField)
      })

      //ADD FOOTER
      block.push(
        {
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url:
                'https://static.formpress.org/images/logo-whiteBG-512x512.png',
              alt_text: 'formpress logo'
            },
            {
              type: 'mrkdwn',
              text: `${index + 1}/${length} Copyright © ${YEAR} *FormPress*`
            }
          ]
        },
        {
          type: 'divider'
        }
      )
    } else {
      //Add form data
      QnA.forEach((currentQnA) => {
        let questionField = {
          type: 'header',
          text: {
            type: 'plain_text',
            text:
              currentQnA.question.length > 140
                ? currentQnA.question.substring(0, 140) + '...'
                : currentQnA.question
          }
        }
        let answerField = {
          type: 'section',
          text: {
            type: 'plain_text',
            text:
              currentQnA.answer.length > 2048
                ? currentQnA.answer.substring(0, 2048) + '...'
                : currentQnA.answer
          }
        }

        block.push(questionField, answerField)
      })

      //ADD FOOTER
      block.push(
        {
          type: 'context',
          elements: [
            {
              type: 'image',
              image_url:
                'https://static.formpress.org/images/logo-whiteBG-512x512.png',
              alt_text: 'formpress logo'
            },
            {
              type: 'mrkdwn',
              text: `${index + 1}/${length} Copyright © ${YEAR} *FormPress*`
            }
          ]
        },
        {
          type: 'divider'
        }
      )
    }
  }

  return block
}

exports.triggerSlackWebhook = async ({
  integrationConfig,
  questionsAndAnswers,
  formTitle
}) => {
  const url = integrationConfig.value
  const chosenInputElems = integrationConfig.chosenInputs
  let selectedQnA = []
  if (chosenInputElems === 'all') {
    selectedQnA = [...questionsAndAnswers]
  } else {
    chosenInputElems.forEach((elemId) => {
      const foundQnA = questionsAndAnswers.find((QnA) => QnA.id === elemId)
      if (foundQnA !== undefined) {
        selectedQnA.push(foundQnA)
      }
    })
  }

  //Group Question and Answer data so that message blocks won't exceed item limit.
  const dataGroups = []
  for (let i = 0; i < selectedQnA.length; i += 23) {
    dataGroups.push(selectedQnA.slice(i, i + 23))
  }

  //send each block/group separately
  for (const [index, value] of dataGroups.entries()) {
    let block
    try {
      block = blockGenerator(value, formTitle, index, dataGroups.length)
    } catch (err) {
      console.log('Error while creating slack block')
      error.errorReport(err)
    }
    try {
      const webhook = new IncomingWebhook(url)

      await webhook.send({
        blocks: block
      })
    } catch (err) {
      console.log('Could not send slack webhook', err)
      error.errorReport(err)
    }
  }
}

exports.slackApi = (app) => {
  app.post('/api/slack/init', async (req, res) => {
    let { url, formTitle } = req.body
    if (formTitle.length > 120) {
      formTitle = formTitle.substring(0, 120) + '...'
    }
    const activationMessage = [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `Now Active for form ${formTitle}!`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'image',
            image_url:
              'https://static.formpress.org/images/logo-whiteBG-512x512.png',
            alt_text: 'formpress logo'
          },
          {
            type: 'mrkdwn',
            text: `Copyright © ${YEAR} *FormPress*`
          }
        ]
      },
      {
        type: 'divider'
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
