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

let tmp = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS
let buff = Buffer.from(tmp, 'base64')
let finalSecret = buff.toString('ascii')
process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE = '/gcp-key.json'
fs.writeFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEYFILE, finalSecret)

const app = express()
const port = parseInt(process.env.SERVER_PORT || 3000)
const verifyEmailMiddleware = require(path.resolve('middleware', 'verifyemail'))
const forgotPasswordMiddleware = require(path.resolve(
  'middleware',
  'forgotpassword'
))

const resetPasswordMiddleware = require(path.resolve(
  'middleware',
  'resetpassword'
))

const changePasswordMiddleware = require(path.resolve(
  'middleware',
  'changepassword'
))

const submissionMiddleware = require(path.resolve('middleware', 'submission'))
const userApiMiddleware = require(path.resolve('middleware', 'userapi'))
const authenticationMiddleware = require(path.resolve(
  'middleware',
  'authentication'
))
const apiMiddleware = require(path.resolve('middleware', 'api'))
const pluginMiddleware = require(path.resolve('middleware', 'plugin'))
const adminApiMiddleware = require(path.resolve('middleware', 'adminapi'))

const googleApisMiddleware = require(path.resolve(
  'middleware',
  'googleApisAuth'
))

const { googleDriveApi } = require(path.resolve(
  'integrations',
  'googledriveapi.js'
))

const { googleSheetsApi } = require(path.resolve(
  'integrations',
  'googlesheetsapi.js'
))

const { discordApi } = require(path.resolve('integrations', 'discordapi.js'))
const { slackApi } = require(path.resolve('integrations', 'slackapi.js'))

let cookieDomain
const corsWhitelist = []

if (FP_ENV === 'development') {
  cookieDomain = 'http://' + process.env.FE_FRONTEND

  const backendUrl = process.env.FE_BACKEND
  corsWhitelist.push(cookieDomain, backendUrl)
} else {
  cookieDomain = 'https://' + process.env.FE_FRONTEND
}

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', cookieDomain)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')

  next()
})

app.use(
  cors({
    origin: function (origin, callback) {
      if (corsWhitelist.indexOf(origin) !== -1) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true
  })
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())
app.use(fileUpload())
app.set('view engine', 'ejs')

authenticationMiddleware(app)
pluginMiddleware(app)
apiMiddleware(app)
userApiMiddleware(app)
adminApiMiddleware(app)
submissionMiddleware(app)
changePasswordMiddleware(app)
googleApisMiddleware(app)
googleDriveApi(app)
googleSheetsApi(app)
discordApi(app)
slackApi(app)

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
