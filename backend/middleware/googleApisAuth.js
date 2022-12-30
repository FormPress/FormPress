const { error } = require('../helper')
const { URLSearchParams } = require('url')
const { google } = require('googleapis')

const port = parseInt(process.env.SERVER_PORT || 3000)
const frontendPort = 3000
const { FP_ENV, FP_HOST } = process.env
const BACKEND = FP_ENV === 'development' ? `${FP_HOST}:${port}` : FP_HOST
const FRONTEND =
  FP_ENV === 'development' ? `${FP_HOST}:${frontendPort}` : FP_HOST

const googleClientID = process.env.GOOGLE_CREDENTIALS_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CREDENTIALS_CLIENT_SECRET
const googleAuthCodeRedirectURI = BACKEND + '/api/services/google/getToken'

module.exports = (app) => {
  app.post(`/api/services/google/generateAuthURL`, async (req, res) => {
    const { scope } = req.body

    if (!scope) {
      return res.status(400).json({ error: 'Invalid scope' })
    }

    const oAuth2Client = new google.auth.OAuth2(
      googleClientID,
      googleClientSecret,
      googleAuthCodeRedirectURI
    )

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scope
    })
    res.json(authUrl)
  })

  app.get('/api/services/google/getToken', async (req, res) => {
    const { code } = req.query

    const oAuth2Client = new google.auth.OAuth2(
      googleClientID,
      googleClientSecret,
      googleAuthCodeRedirectURI
    )

    oAuth2Client.getToken(code, async (err, token) => {
      let status
      let base64Token
      if (err) {
        status = false
        console.log('Error retrieving access token', err)
      } else {
        try {
          oAuth2Client.setCredentials(token)

          const buff = Buffer.from(JSON.stringify(token), 'utf8')
          base64Token = buff.toString('base64')

          status = true
        } catch (err) {
          error.errorReport(err)
          console.log('Error while setting credentials', err)
          status = false
        }
      }

      const redirectURL =
        FP_ENV === 'development'
          ? `${FRONTEND}/read/development/googleAuth?`
          : `${FRONTEND}/read/googleAuth?`

      const components = {
        message: status,
        token: base64Token
      }
      const urlParameters = new URLSearchParams(components)
      res.redirect(redirectURL + urlParameters)
    })
  })

  app.get('/read/googleAuth', async (req, res) => {
    res.render('readCallback.ejs')
  })
}
