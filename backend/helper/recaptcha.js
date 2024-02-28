const path = require('path')
const {
  RecaptchaEnterpriseServiceClient
} = require('@google-cloud/recaptcha-enterprise')
const { error } = require(path.resolve('helper'))

// check if both env variables are set, if not, do not initialize client
if (!process.env.GCP_PROJECT_ID || !process.env.RECAPTCHA_SITE_KEY) {
  console.log('reCAPTCHA is not initialized. Reason: missing env variables.')
}

const projectID = process.env.GCP_PROJECT_ID
const recaptchaSiteKey = process.env.RECAPTCHA_SITE_KEY

const client = new RecaptchaEnterpriseServiceClient()
const projectPath = projectID ? client.projectPath(projectID) : null

async function verifyToken(token) {
  if (!token) {
    return false
  }

  if (!projectPath) {
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
