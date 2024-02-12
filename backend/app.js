const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const cookieParser = require('cookie-parser')

const fileUpload = require('express-fileupload')
const transform = require(path.resolve('script', 'babel-transform'))
const sassCompile = require(path.resolve('script', 'sass-compiler'))

const { FP_ENV } = process.env

if (FP_ENV !== 'development') {
  sassCompile()
}

transform()

const isEnvironmentVariableSet = {
  googleServiceAccountCredentials:
    process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS !== '',
  sendgridApiKey: process.env.SENDGRID_API_KEY !== '',
  googleCredentialsClientID: process.env.GOOGLE_CREDENTIALS_CLIENT_ID !== '',
  fileUploadBucket: process.env.FILE_UPLOAD_BUCKET !== ''
}

const oauthClientsPresent = process.env.OAUTH_CLIENTS !== ''

//for local environments
if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
  let tmp = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
  let buff = Buffer.from(tmp, 'base64')
  let finalSecret = buff.toString('ascii')
  process.env.GOOGLE_APPLICATION_CREDENTIALS = '/gcp-key.json'
  fs.writeFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, finalSecret)
}

const app = express()
const port = parseInt(process.env.SERVER_PORT || 3000)
const verifyEmailMiddleware = require(path.resolve('middleware', 'verifyemail'))
const forgotPasswordMiddleware = require(
  path.resolve('middleware', 'forgotpassword')
)

const resetPasswordMiddleware = require(
  path.resolve('middleware', 'resetpassword')
)

const changePasswordMiddleware = require(
  path.resolve('middleware', 'changepassword')
)

const submissionMiddleware = require(path.resolve('middleware', 'submission'))
const userApiMiddleware = require(path.resolve('middleware', 'userapi'))
const authenticationMiddleware = require(
  path.resolve('middleware', 'authentication')
)
const apiMiddleware = require(path.resolve('middleware', 'api'))
const apiFormsMiddleware = require(path.resolve('middleware', 'api-forms'))
const pluginMiddleware = require(path.resolve('middleware', 'plugin'))
const adminApiMiddleware = require(path.resolve('middleware', 'adminapi'))
const downloadApiMiddleware = require(path.resolve('middleware', 'downloadapi'))
const oauth = require(path.resolve('middleware', 'oauth'))

const googleApisMiddleware = require(
  path.resolve('middleware', 'googleApisAuth')
)

const { googleDriveApi } = require(
  path.resolve('integrations', 'googledriveapi.js')
)

const { googleSheetsApi } = require(
  path.resolve('integrations', 'googlesheetsapi.js')
)

const { discordApi } = require(path.resolve('integrations', 'discordapi.js'))
const { slackApi } = require(path.resolve('integrations', 'slackapi.js'))

const { apiKeys } = require(path.resolve('middleware', 'apikeys.js'))

const csvExportApi = require(path.resolve('middleware', 'exportcsv'))
const { formWebhooksApi } = require(
  path.resolve('middleware', 'formwebhooks.js')
)

const corsWhitelist = []

if (FP_ENV === 'development') {
  let frontend = process.env.FE_FRONTEND
  corsWhitelist.push(frontend)
  let backend = process.env.FE_BACKEND
  corsWhitelist.push(backend)

  app.use(
    cors({
      origin: function (origin, callback) {
        // Same origin requests do not have an origin header, they are not CORS requests. So undefined is allowed.
        if (origin === undefined || corsWhitelist.indexOf(origin) !== -1) {
          callback(null, true)
        } else {
          callback(new Error('Not allowed by CORS'))
        }
      },
      credentials: true
    })
  )
}

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', process.env.FE_FRONTEND)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')

  next()
})

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(fileUpload())
app.set('view engine', 'ejs')

authenticationMiddleware(app)
pluginMiddleware(app)
apiMiddleware(app)
apiFormsMiddleware(app)
userApiMiddleware(app)
adminApiMiddleware(app)
downloadApiMiddleware(app)
submissionMiddleware(app)
changePasswordMiddleware(app)
csvExportApi(app)
discordApi(app)
slackApi(app)
formWebhooksApi(app)
apiKeys(app)

if (oauthClientsPresent) {
  oauth(app)
}

if (isEnvironmentVariableSet.googleCredentialsClientID) {
  googleApisMiddleware(app)
  googleDriveApi(app)
  googleSheetsApi(app)
}

if (isEnvironmentVariableSet.sendgridApiKey) {
  verifyEmailMiddleware(app)
  forgotPasswordMiddleware(app)
  resetPasswordMiddleware(app)
}

if (process.env.FP_ENV === 'production') {
  app.use(express.static('/frontend/build'))

  const staticIndexHtml = fs.readFileSync('/frontend/build/index.html', {
    encoding: 'utf8'
  })

  // Send built index.html to allow refreshes to work
  app.get('*', (req, res) => {
    res.header('Content-type', 'text/html')
    res.status(200).send(staticIndexHtml)
  })
} else {
  app.use(express.static('/frontend/public'))
}

//Checking of environment variables. Console logs for server capabilities.
if (isEnvironmentVariableSet.sendgridApiKey === false) {
  console.log(
    '[WARN] SendGrid environment variable is not set. E-mail delivery and related features are disabled.'
  )
}
if (isEnvironmentVariableSet.googleCredentialsClientID === false) {
  console.log(
    '[WARN] Google Client ID environment variable is not set. Google Sign-In is disabled.'
  )
}
if (isEnvironmentVariableSet.fileUploadBucket === false) {
  console.log(
    '[WARN] FileBucket environment variable is not set. File upload is disabled.'
  )
}
if (isEnvironmentVariableSet.googleServiceAccountCredentials === false) {
  console.log(
    '[WARN] Google Service Account Credentials environment variable is not set. Google Cloud service & file upload are disabled.'
  )
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
