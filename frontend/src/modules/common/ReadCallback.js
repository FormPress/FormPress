import React, { Component } from 'react'

export default class ReadCallback extends Component {
  componentDidMount() {
    const urlArray = window.location.pathname.split('/')
    const callbackType = urlArray[urlArray.length - 1]
    if (callbackType === 'googleAuth') {
      const params = new URLSearchParams(window.location.search)

      const status = params.get('message')
      const base64Token = params.get('token')

      if (status === 'true') {
        window.opener.postMessage(
          {
            type: 'googleAuthToken',
            base64Token
          },
          window.opener.origin
        )
      }
    }
    window.close()
  }

  render() {
    return <div className="success-page"></div>
  }
}
