import React, { Component } from 'react'

import './Status.css'

export default class Status extends Component {
  render() {
    return (
      <div className="statuswrap">
        <div className="col-2-16 statuslist">
          <div className="status">
            Google Service Account Credentials:{' '}
            {this.props.generalContext.capabilities
              .googleServiceAccountCredentials
              ? 'true'
              : 'false'}
          </div>
          <div className="status">
            Sendgrid Api Key:{' '}
            {this.props.generalContext.capabilities.sendgridApiKey
              ? 'true'
              : 'false'}
          </div>
          <div className="status">
            Google Credentials Client ID:{' '}
            {this.props.generalContext.capabilities.googleCredentialsClientID
              ? 'true'
              : 'false'}
          </div>
          <div className="status">
            File Upload Bucket:{' '}
            {this.props.generalContext.capabilities.fileUploadBucket
              ? 'true'
              : 'false'}
          </div>
        </div>
      </div>
    )
  }
}
