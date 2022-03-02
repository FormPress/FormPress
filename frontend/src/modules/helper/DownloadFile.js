import React, { Component } from 'react'
import { api } from '../../helper'
import AuthContext from '../../auth.context'
class Download extends Component {
  constructor(props) {
    super(props)
    this.startDownload = this.startDownload.bind(this)
    this.state = {
      message: ''
    }
  }

  async startDownload(fileName) {
    const resource = `/api/users/${this.props.auth.user_id}/forms/${this.props.match.params.formId}/submissions/${this.props.match.params.submissionId}/questions/${this.props.match.params.questionId}/${fileName}`

    const { status, data } = await api({
      resource: resource,
      useBlob: true
    })
    if (status !== 200) {
      this.setState({ message: data.message })
    } else {
      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)

      this.setState({
        message:
          'Your download has started. If not, please click the "Download" button again.'
      })
    }
  }

  render() {
    let fileName = ''
    try {
      fileName = decodeURI(this.props.match.params.fileName)
    } catch (e) {
      console.error(e)
    }
    return (
      <div>
        <div className="downloadButton">
          <button type="button" onClick={() => this.startDownload(fileName)}>
            Download
          </button>
          <span>{fileName}</span>
        </div>
        <div>{this.state.message}</div>
      </div>
    )
  }
}

const DownloadWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Download {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default DownloadWrapped
