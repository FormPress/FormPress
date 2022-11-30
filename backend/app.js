const express = require('express')
const path = require('path')
const fs = require('fs')
const cors = require('cors')

const fileUpload = require('express-fileupload')
const transform = require(path.resolve('script', 'babel-transform'))

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
const signupMiddleware = require(path.resolve('middleware', 'signup'))
const loginMiddleware = require(path.resolve('middleware', 'login'))
const loginWithGoogleMiddleware = require(path.resolve(
  'middleware',
  'loginwithgoogle'
))
const authenticationMiddleware = require(path.resolve(
  'middleware',
  'authentication'
))
const apiMiddleware = require(path.resolve('middleware', 'api'))
const pluginMiddleware = require(path.resolve('middleware', 'plugin'))
const adminApiMiddleware = require(path.resolve('middleware', 'adminapi'))
const { authGoogleDrive } = require(path.resolve(
  'integrations',
  'googledriveapi.js'
))

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')

  next()
})

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use(fileUpload())
app.set('view engine', 'ejs')

authenticationMiddleware(app)
loginWithGoogleMiddleware(app)
apiMiddleware(app)
pluginMiddleware(app)
adminApiMiddleware(app)
loginMiddleware(app)
signupMiddleware(app)
submissionMiddleware(app)
changePasswordMiddleware(app)
authGoogleDrive(app)

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
