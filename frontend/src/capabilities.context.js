import React from 'react'

const CapabilitiesContext = React.createContext({
  googleServiceAccountCredentials: false,
  sendgridApiKey: false,
  googleCredentialsClientID: false,
  fileUploadBucket: false
})

export default CapabilitiesContext
