const { google } = require('googleapis')
const { URLSearchParams } = require('url')
const { Duplex } = require('stream')

const SCOPES = ['https://www.googleapis.com/auth/drive.file']
const googleDriveClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET
const googleDriveClientID = process.env.GOOGLE_DRIVE_CLIENT_ID
const googleDriveRedirectURI = process.env.GOOGLE_DRIVE_REDIRECT_URI

const oAuth2Client = new google.auth.OAuth2(
  googleDriveClientID,
  googleDriveClientSecret,
  googleDriveRedirectURI
)

exports.authGoogleDrive = (app) => {
  app.post(`/api/integrations/googledrive/authenticate`, async (req, res) => {
    const { folderName, submissionIdentifier } = req.body
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
      state: JSON.stringify({
        folder_name: folderName,
        submission_identifier_id: submissionIdentifier.id,
        submission_identifier_type: submissionIdentifier.type
      })
    })
    res.json(authUrl)
  })
  app.get('/api/integrations/googledrive/getToken', async (req, res) => {
    const { code, state } = req.query
    oAuth2Client.getToken(code, async (err, token) => {
      let status
      let base64Token
      let folderID
      if (err) {
        status = false
        console.log('Error retrieving access token', err)
      } else {
        try {
          oAuth2Client.setCredentials(token)

          const buff = Buffer.from(JSON.stringify(token), 'utf8')
          base64Token = buff.toString('base64')

          folderID = await createFolder(
            oAuth2Client,
            JSON.parse(state).folder_name
          )

          status = true
        } catch (err) {
          console.log('Error while setting credentials', err)
          status = false
        }
      }
      const redirectURL = 'http://localhost:3000/read/googledrive?'
      const components = {
        message: status,
        token: base64Token,
        folderID: folderID,
        submissionIdentifierId: JSON.parse(state).submission_identifier_id,
        submissionIdentifierType: JSON.parse(state).submission_identifier_type
      }
      const urlParameters = new URLSearchParams(components)
      res.redirect(redirectURL + urlParameters)
    })
  })

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
}

exports.gdUploadFile = async (folderID, pdfBuffer, fileName, token) => {
  oAuth2Client.setCredentials({ refresh_token: token.refresh_token })
  const service = google.drive({ version: 'v3', auth: oAuth2Client })
  let duplex = new Duplex()
  duplex.push(pdfBuffer)
  duplex.push(null)
  const fileMetadata = {
    name: fileName + '.pdf',
    parents: [folderID]
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
