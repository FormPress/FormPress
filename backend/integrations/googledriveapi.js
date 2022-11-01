const { google } = require('googleapis')
const { URLSearchParams } = require('url')
const { Duplex } = require('stream')
const { error } = require('../helper')

const port = parseInt(process.env.SERVER_PORT || 3000)
const frontendPort = 3000
const { FP_ENV, FP_HOST } = process.env
const BACKEND = FP_ENV === 'development' ? `${FP_HOST}:${port}` : FP_HOST
const FRONTEND =
  FP_ENV === 'development' ? `${FP_HOST}:${frontendPort}` : FP_HOST

const SCOPES = ['https://www.googleapis.com/auth/drive.file']
const googleDriveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET
const googleDriveClientID = process.env.GOOGLE_DRIVE_CLIENT_ID
const googleDriveRedirectURI =
  BACKEND + '/api/integrations/googledrive/getToken'
const oAuth2Client = new google.auth.OAuth2(
  googleDriveClientID,
  googleDriveClientSecret,
  googleDriveRedirectURI
)

async function createFolder(auth, title) {
  const service = google.drive({ version: 'v3', auth: auth })
  const fileMetadata = {
    name: title,
    mimeType: 'application/vnd.google-apps.folder'
  }
  try {
    const file = await service.files.create({
      resource: fileMetadata,
      fields: 'id'
    })
    return file.data.id
  } catch (err) {
    console.log('Error while creating folder', err)
  }
}

exports.authGoogleDrive = (app) => {
  app.post(`/api/integrations/googledrive/authenticate`, async (req, res) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES
    })
    res.json(authUrl)
  })

  app.get('/api/integrations/googledrive/getToken', async (req, res) => {
    const { code } = req.query
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
          ? `${FRONTEND}/read/development/googledrive?`
          : `${FRONTEND}/read/googledrive?`

      const components = {
        message: status,
        token: base64Token
      }
      const urlParameters = new URLSearchParams(components)
      res.redirect(redirectURL + urlParameters)
    })
  })

  app.post(`/api/integrations/googledrive/createFolder`, async (req, res) => {
    const { targetFolder, token } = req.body
    oAuth2Client.setCredentials({ refresh_token: token.refresh_token })

    targetFolder.id = await createFolder(oAuth2Client, targetFolder.name)
    res.json(targetFolder)
  })

  app.get('/read/googledrive', async (req, res) => {
    res.render('readCallback.ejs')
  })
}

exports.gdUploadFile = async (targetFolder, pdfBuffer, fileName, token) => {
  oAuth2Client.setCredentials({ refresh_token: token.refresh_token })
  const service = google.drive({ version: 'v3', auth: oAuth2Client })
  let duplex = new Duplex()
  duplex.push(pdfBuffer)
  duplex.push(null)

  const folderExists = await service.files
    .get({
      fileId: targetFolder.id
    })
    .catch((err) => {
      console.log(err)
      return false
    })

  if (!folderExists) {
    console.log('Google Drive folder does not exist. Creating folder...')
    targetFolder.id = await createFolder(oAuth2Client, targetFolder.name)
  }

  const fileMetadata = {
    name: fileName + '.pdf',
    parents: [targetFolder.id]
  }
  const media = {
    mimeType: 'application/pdf',
    body: duplex
  }
  try {
    const file = await service.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    })
    return file.data.id
  } catch (err) {
    console.log(err)
  }
}
