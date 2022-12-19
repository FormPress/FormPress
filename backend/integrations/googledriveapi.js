const { google } = require('googleapis')
const { Duplex } = require('stream')

const port = parseInt(process.env.SERVER_PORT || 3000)
const { FP_ENV, FP_HOST } = process.env
const BACKEND = FP_ENV === 'development' ? `${FP_HOST}:${port}` : FP_HOST

const googleClientID = process.env.GOOGLE_CREDENTIALS_CLIENT_ID
const googleClientSecret = process.env.GOOGLE_CREDENTIALS_CLIENT_SECRET
const googleAuthCodeRedirectURI = BACKEND + '/api/services/google/getToken'

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
    return { id: file.data.id, name: title }
  } catch (err) {
    console.log('Error while creating folder', err)
    return false
  }
}

exports.gdUploadFile = async (targetFolder, pdfBuffer, fileName, token) => {
  const oAuth2Client = new google.auth.OAuth2(
    googleClientID,
    googleClientSecret,
    googleAuthCodeRedirectURI
  )

  oAuth2Client.setCredentials({ refresh_token: token.refresh_token })
  const service = google.drive({ version: 'v3', auth: oAuth2Client })
  let duplex = new Duplex()
  duplex.push(pdfBuffer)
  duplex.push(null)

  let folderName

  if (targetFolder?.name) {
    folderName = targetFolder.name
  } else {
    folderName = ''
  }

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
    targetFolder = await createFolder(oAuth2Client, folderName)
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

exports.googleDriveApi = (app) => {
  app.post(`/api/integrations/googledrive/createFolder`, async (req, res) => {
    const { targetFolder, token } = req.body

    const oAuth2Client = new google.auth.OAuth2(
      googleClientID,
      googleClientSecret,
      googleAuthCodeRedirectURI
    )

    oAuth2Client.setCredentials({ refresh_token: token.refresh_token })

    let folderName

    if (targetFolder?.name) {
      folderName = targetFolder.name
    } else {
      folderName = ''
    }

    const response = await createFolder(oAuth2Client, folderName)

    if (response === false) {
      return res
        .status(400)
        .json({ error: true, message: 'Error while creating folder.' })
    }

    res.json(response)
  })
}
