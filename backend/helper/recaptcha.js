const path = require('path')
const {
  RecaptchaEnterpriseServiceClient
} = require('@google-cloud/recaptcha-enterprise')
const { error } = require(path.resolve('helper'))

// check if both env variables are set, if not, do not initialize client
if (!process.env.GCP_PROJECT_ID || !process.env.RECAPTCHA_SITE_KEY) {
  console.log('reCAPTCHA is not initialized. Reason: missing env variables.')
  return
}

const client = new RecaptchaEnterpriseServiceClient()
const projectID = process.env.GCP_PROJECT_ID

const projectPath = client.projectPath(projectID)

const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY

async function verifyToken(token) {
  if (!token) {
    return false
  }

  try {
    const assessments = await client.createAssessment({
      parent: projectPath,
      assessment: {
        event: {
          siteKey: recaptchaSiteKey,
          token: token
        }
      }
    })

    console.log('assessment', assessments)

    if (assessments[0].tokenProperties.valid) {
      return true
    } else {
      return false
    }
  } catch (err) {
    console.log('err', err)
    error.errorReport(err)
    return false
  }
}

module.exports = {
  verifyToken
}
