import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api } from '../../helper'

import './Status.css'

class Status extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      status: {
        googleServiceAccountCredentials: '',
        sendgridApiKey: '',
        googleCredentialsClientID: '',
        fileUploadBucket: ''
      }
    }

    this.capabilities = this.capabilities.bind(this)
  }

  async capabilities() {
    const result = await api({
      resource: `/api/server/capabilities`,
      method: 'get'
    })

    const newStatus = { ...this.state.status }

    if (result.data.googleServiceAccountCredentials) {
      newStatus.googleServiceAccountCredentials = 'true'
    }
    if (result.data.sendgridApiKey) {
      newStatus.sendgridApiKey = 'true'
    }
    if (result.data.googleCredentialsClientID) {
      newStatus.googleCredentialsClientID = 'true'
    }
    if (result.data.fileUploadBucket) {
      newStatus.fileUploadBucket = 'true'
    }

    this.setState({ loaded: true, status: newStatus })
  }

  async componentDidMount() {
    await this.capabilities()
  }

  render() {
    return (
      <div className="statuswrap">
        <div className="col-2-16 statuslist">
          <div className="status">
            Google Service Account Credentials:{' '}
            {this.state.status.googleServiceAccountCredentials}
          </div>
          <div className="status">
            Sendgrid Api Key: {this.state.status.sendgridApiKey}
          </div>
          <div className="status">
            Google Credentials Client ID:{' '}
            {this.state.status.googleCredentialsClientID}
          </div>
          <div className="status">
            File Upload Bucket: {this.state.status.fileUploadBucket}
          </div>
        </div>
      </div>
    )
  }
}

const StatusWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Status {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default StatusWrapped
