import React, { Component } from 'react'
import { GoogleLogin } from 'react-google-login'
import AuthContext from '../../auth.context'

const GOOGLE_CREDENTIALS_CLIENT_ID =
  process.env.REACT_APP_GOOGLE_CREDENTIALS_CLIENT_ID

class LoginWithGoogle extends Component {
  render() {
    return (
      <GoogleLogin
        clientId={GOOGLE_CREDENTIALS_CLIENT_ID}
        render={(renderProps) => (
          <button onClick={renderProps.onClick} disabled={renderProps.disabled || this.props.disabled}>
            Sign in via Google
          </button>
        )}
        buttonText="Login"
        onSuccess={this.props.handleLoginWithGoogleButton}
        onFailure={this.props.handleLoginWithGoogleFail}
        cookiePolicy={'single_host_origin'}
      />
    )
  }
}

const LoginWithGoogleWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <LoginWithGoogle {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default LoginWithGoogleWrapped
