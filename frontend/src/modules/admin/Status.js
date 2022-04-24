import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api } from '../../helper'

import './Status.css'

class Status extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      googleServiceAccountCredentials: null,
      sendgridApiKey: null,
      googleCredentialsClientID: null,
      fileUploadBucket: null,
    }

    this.capabilities = this.capabilities.bind(this)
  }

  async capabilities() {
    const result = await api({
      resource: `/api/server/capabilities`,
      method: 'get'
    })

    if (result.data.googleServiceAccountCredentials) {
      this.setState({ loaded: true, googleServiceAccountCredentials: 'true'})
    }
    if (result.data.sendgridApiKey) {
      this.setState({ loaded: true, sendgridApiKey: 'true'})
    }
    if (result.data.googleCredentialsClientID) {
      this.setState({ loaded: true, googleCredentialsClientID: 'true'})
    }
    if (result.data.fileUploadBucket) {
      this.setState({ loaded: true, fileUploadBucket: 'true'})
    }
  }

  async componentDidMount() {
    await this.capabilities()
  }

  render() {
    return (
      <div className="statuswrap">
        <div className="col-2-16 statuslist">
          <div className='status'>
          Google Service Account Credentials: {this.state.googleServiceAccountCredentials}
          </div>
          <div className='status'>
          Sendgrid Api Key: {this.state.sendgridApiKey}
          </div>
          <div className='status'>
          Google Credentials Client ID: {this.state.googleCredentialsClientID}
          </div>
          <div className='status'>
          File Upload Bucket: {this.state.fileUploadBucket}
          </div>
        </div>
      </div>
    )
  }
}

const StatusWrapped = (props) => (
    <AuthContext.Consumer>
      {(value) => (
        <Status {...props} auth={value} />
      )}
    </AuthContext.Consumer>
  )

export default StatusWrapped
