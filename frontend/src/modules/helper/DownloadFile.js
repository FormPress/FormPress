import React, { Component } from 'react'
import { api } from '../../helper'

export default class Download extends Component {
  constructor(props) {
    super(props)
    this.startDownload = this.startDownload.bind(this)
    this.state = {
      message: ''
    }
  }

  async componentDidMount() {
    const params = this.props.match.params

    const result = await api({
      resource: `/api/checkIfFileIsExist/${this.props.generalContext.auth.user_id}/${params.formId}/${params.submissionId}/${params.questionId}/${params.fileName}`,
      method: 'get'
    })

    if (result.data.message === 'That form is not yours') {
      window.location.href = '/404'
    }

    if (result.data.message === 'Submission not found') {
      window.location.href = '/404'
    }

    if (result.data[0] === false) {
      window.location.href = '/404'
    }
  }

  async startDownload(fileName) {
    const resource = `/api/users/${this.props.generalContext.auth.user_id}/forms/${this.props.match.params.formId}/submissions/${this.props.match.params.submissionId}/questions/${this.props.match.params.questionId}/${fileName}`

    const { status, data } = await api({
      resource: resource,
      responseType: 'blob'
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
