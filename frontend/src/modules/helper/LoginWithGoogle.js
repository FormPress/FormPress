import React, { Component } from 'react'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

export default class LoginWithGoogle extends Component {
  render() {
    const { context } = this.props
    return (
      <GoogleOAuthProvider
        clientId={global.env.FE_GOOGLE_CREDENTIALS_CLIENT_ID}>
        <GoogleLogin
          width={332}
          shape={'rectangular'}
          size={'large'}
          logo_alignment={'left'}
          useOneTap={true}
          context={context || 'signin'}
          onSuccess={this.props.handleLoginWithGoogleButton}
          onFailure={this.props.handleLoginWithGoogleFail}
          cookiePolicy={'single_host_origin'}
        />
      </GoogleOAuthProvider>
    )
  }
}
