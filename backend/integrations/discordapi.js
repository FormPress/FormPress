const { EmbedBuilder, WebhookClient } = require('discord.js')
const { error } = require('../helper')
const icon =
  'https://storage.googleapis.com/static.formpress.org/images/logo-whiteBG-512x512.png'

const embedBuilder = (QnA, title) => {
  QnA.sort(function (a, b) {
    return a.id - b.id
  })

  let embeds = []
  let currentEmbed = []

  QnA.forEach((currentQnAData) => {
    currentEmbed.push({
      name: currentQnAData.question,
      value: currentQnAData.answer
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
      .setColor(3324696)
      .addFields(...fieldData)
      .setTimestamp()
      .setFooter({
        text:
          `${index + 1}/${embeds.length}` +
          ' '.repeat(50) +
          'Copyright © 2023 FormPress',
        iconURL: icon
      })
    if (index === 0) {
      embed.setTitle(`New Response: ${title}`)
    }

    embedsCombined.push(embed)
  })

  return embedsCombined
}

exports.discordApi = (app) => {
  app.post('/api/discord/init', async (req, res) => {
    const { url, formTitle } = req.body

    const activationEmbed = new EmbedBuilder()
      .setTitle(`Submission Notifier Is Now Active for form **${formTitle}**!`)
      .setColor(0x00ffff)

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

  const selectedQnA = []
  chosenInputElems.forEach((elem) => {
    const foundQnA = questionsAndAnswers.find((QnA) => QnA.id === elem.id)
    if (foundQnA !== undefined) {
      selectedQnA.push(foundQnA)
    }
  })

  const embeds = embedBuilder(selectedQnA, formTitle)

  try {
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
