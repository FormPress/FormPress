import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api } from '../../helper'
import CapabilitiesContext from '../../capabilities.context'

import './Status.css'

class Status extends Component {
  render() {
    return (
      <div className="statuswrap">
        <div className="col-2-16 statuslist">
          <div className="status">
            Google Service Account Credentials:{' '}
            {this.props.capabilities.googleServiceAccountCredentials
              ? 'true'
              : 'false'}
          </div>
          <div className="status">
            Sendgrid Api Key:{' '}
            {this.props.capabilities.sendgridApiKey ? 'true' : 'false'}
          </div>
          <div className="status">
            Google Credentials Client ID:{' '}
            {this.props.capabilities.googleCredentialsClientID
              ? 'true'
              : 'false'}
          </div>
          <div className="status">
            File Upload Bucket:{' '}
            {this.props.capabilities.fileUploadBucket ? 'true' : 'false'}
          </div>
        </div>
      </div>
    )
  }
}

const StatusWrapped = (props) => (
  <CapabilitiesContext.Consumer>
    {(capabilities) => (
      <AuthContext.Consumer>
        {(value) => (
          <Status {...props} auth={value} capabilities={capabilities} />
        )}
      </AuthContext.Consumer>
    )}
  </CapabilitiesContext.Consumer>
)

export default StatusWrapped
