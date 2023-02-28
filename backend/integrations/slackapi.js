const { IncomingWebhook } = require('@slack/webhook')

const { error } = require('../helper')

const blockGenerator = (QnA, title, index, length) => {
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
              'https://storage.googleapis.com/static.formpress.org/images/logo-whiteBG-512x512.png',
            alt_text: 'formpress logo'
          },
          {
            type: 'mrkdwn',
            text: `${index + 1}/${length} Copyright © 2022 *FormPress*`
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
                'https://storage.googleapis.com/static.formpress.org/images/logo-whiteBG-512x512.png',
              alt_text: 'formpress logo'
            },
            {
              type: 'mrkdwn',
              text: `${index + 1}/${length} Copyright © 2022 *FormPress*`
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
                'https://storage.googleapis.com/static.formpress.org/images/logo-whiteBG-512x512.png',
              alt_text: 'formpress logo'
            },
            {
              type: 'mrkdwn',
              text: `${index + 1}/${length} Copyright © 2022 *FormPress*`
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

  //Group Question and Answer data so that message blocks won't exceed item limit.
  const dataGroups = []
  for (let i = 0; i < selectedQnA.length; i += 23) {
    dataGroups.push(selectedQnA.slice(i, i + 23))
  }

  //send each block/group separately
  for (const [index, value] of dataGroups.entries()) {
    const block = blockGenerator(value, formTitle, index, dataGroups.length)
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
