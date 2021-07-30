import React, { Component } from 'react'
import { GoogleLogin } from 'react-google-login'
import AuthContext from '../../auth.context'

class LoginWithGoogle extends Component {
  render() {
    return (
      <GoogleLogin
        clientId="763212824993-o0fl1ru6okjbcltn69sui769ve3cfgtf.apps.googleusercontent.com"
        render={(renderProps) => (
          <button onClick={renderProps.onClick} disabled={renderProps.disabled}>
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
