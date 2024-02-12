const { EmbedBuilder, WebhookClient } = require('discord.js')
const { error } = require('../helper')
const icon = 'https://static.formpress.org/images/logo-whiteBG-512x512.png'
const discordFieldValueCharacterLimit = 1000
const discordFieldNameCharacterLimit = 250
const YEAR = new Date().getFullYear()
const embedBuilder = (QnA, title) => {
  let embeds = []
  let currentEmbed = []
  QnA.forEach((currentQnAData) => {
    currentEmbed.push({
      name:
        currentQnAData.question.length > discordFieldNameCharacterLimit
          ? currentQnAData.question.substring(0, discordFieldNameCharacterLimit)
          : currentQnAData.question,
      value:
        currentQnAData.answer.length > discordFieldValueCharacterLimit
          ? currentQnAData.answer.substring(0, discordFieldValueCharacterLimit)
          : currentQnAData.answer
    })

    if (currentEmbed.length === 25) {
      embeds.push(currentEmbed)
      currentEmbed = []
    }
  })
  embeds.push(currentEmbed)

  const embedsCombined = []
  embeds.forEach((fieldData, index) => {
    let embed = new EmbedBuilder()
      .setColor(29116)
      .addFields(...fieldData)
      .setTimestamp()
      .setFooter({
        text:
          `${index + 1}/${embeds.length}` +
          ' '.repeat(50) +
          `Copyright © ${YEAR} FormPress`,
        iconURL: icon
      })
    if (index === 0) {
      if (title.length > 190) {
        title = title.substring(0, 190) + '...'
      }
      embed.setTitle(`New Response: ${title}`)
    }

    embedsCombined.push(embed)
  })

  return embedsCombined
}

exports.discordApi = (app) => {
  app.post('/api/discord/init', async (req, res) => {
    let { url, formTitle } = req.body
    if (formTitle.length > 190) {
      formTitle = formTitle.substring(0, 190) + '...'
    }
    const activationEmbed = new EmbedBuilder()
      .setTitle(`Submission Notifier Is Now Active for form **${formTitle}**!`)
      .setColor(9225791)

    try {
      const webhookClient = new WebhookClient({
        url
      })

      await webhookClient.send({
        username: 'FormPress',
        avatarURL: icon,
        embeds: [activationEmbed]
      })
      return res.status(200).json({ message: 'connection established' })
    } catch (err) {
      return res
        .status(400)
        .json({ message: 'cannot create discord webhook client' })
    }
  })
}

exports.triggerDiscordWebhook = async ({
  integrationConfig,
  questionsAndAnswers,
  formTitle
}) => {
  const url = integrationConfig.value
  const chosenInputElems = integrationConfig.chosenInputs

  let selectedQnA = []
  if (integrationConfig.customizeInputs === false) {
    selectedQnA = [...questionsAndAnswers]
  } else {
    chosenInputElems.forEach((elem) => {
      const foundQnA = questionsAndAnswers.find((QnA) => QnA.id === elem.id)
      if (foundQnA !== undefined) {
        selectedQnA.push(foundQnA)
      }
    })
  }

  //discord.js does not support empty strings on question names
  selectedQnA.forEach((qna) => {
    if (qna.question === '') {
      qna.question = '-'
    }
  })

  try {
    const embeds = embedBuilder(selectedQnA, formTitle)
    const webhookClient = new WebhookClient({ url })
    await webhookClient.send({
      username: 'FormPress',
      avatarURL: icon,
      embeds: embeds
    })
  } catch (err) {
    console.log('Could not send discord webhook', err)
    error.errorReport(err)
  }
}
