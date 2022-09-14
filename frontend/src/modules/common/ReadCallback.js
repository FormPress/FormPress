import React, { Component } from 'react'

export default class ReadCallback extends Component {
  componentDidMount() {
    const urlArray = window.location.pathname.split('/')
    const integrationType = urlArray[urlArray.length - 1]
    if (integrationType === 'googledrive') {
      const params = new URLSearchParams(window.location.search)

      const status = params.get('message')
      const base64Token = params.get('token')
      const folderID = params.get('folderID')
      const submissionIdentifierId = params.get('submissionIdentifierId')
      const submissionIdentifierType = params.get('submissionIdentifierType')

      if (status === 'true') {
        window.opener.postMessage(
          {
            type: 'gdriveCallback',
            base64Token,
            folderID,
            submissionIdentifierId,
            submissionIdentifierType
          },
          '*'
        )
      }
    }
    window.close()
  }

  render() {
    return <div className="success-page"></div>
  }
}
