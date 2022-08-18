import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { api, setToken } from '../helper'
import { LoginPicture } from '../svg'
import Renderer from './Renderer'
import AuthContext from '../auth.context'
import CapabilitiesContext from '../capabilities.context'
import LoginWithGoogle from './helper/LoginWithGoogle'
import './SignUp.css'

class SignUp extends Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      password: '',
      passwordRe: '',
      message: '',
      success: false,
      state: 'initial' // one of, initial, loading, done
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleSignUpButtonClick = this.handleSignUpButtonClick.bind(this)
    this.handleLoginWithGoogleClick = this.handleLoginWithGoogleClick.bind(this)
    this.handleLoginWithGoogleFail = this.handleLoginWithGoogleFail.bind(this)

    this.formRef = React.createRef()
  }

  handleFieldChange(elem, e) {
    let stateKey = ''
    if (elem.id === 1) {
      stateKey = 'email'
    } else if (elem.id === 2) {
      stateKey = 'password'
    } else if (elem.id === 3) {
      stateKey = 'passwordRe'
    } else {
      stateKey = null
    }
    if (stateKey === null) {
      return
    }

    this.setState({ [stateKey]: e.target.value })
  }

  async handleSignUpButtonClick(e) {
    e.preventDefault()
    this.setState({ state: 'signup' })

    const { email, password } = this.state
    let pattern = /^.{8,}$/,
      signupErrorHandler = 0

    const simpleEmailRegex = /^\S{1,}@\S{2,}\.\S{2,}$/
    if (!email) {
      this.setState({ message: 'Please use a valid email' })
      signupErrorHandler++
    } else if (simpleEmailRegex.exec(email) === null) {
      this.setState({ message: 'Please use a valid email' })
      signupErrorHandler++
    } else if (!password || password !== this.state.passwordRe) {
      this.setState({ message: 'Password should match' })
      signupErrorHandler++
    } else if (!pattern.test(password)) {
      this.setState({
        message: 'New password must contain at least 8 characters.'
      })
      signupErrorHandler++
    }

    if (signupErrorHandler > 0) {
      window.scrollTo({
        top: this.formRef.current.offsetTop,
        behavior: 'smooth'
      })
      signupErrorHandler = 0
      return
    }

    this.setState({ state: 'loading', message: 'Processing' })
    const { success, data } = await api({
      resource: `/api/users/signup`,
      method: 'post',
      body: { email, password }
    })

    if (success) {
      this.setState({ success: true, state: 'done', message: data.message })
    } else {
      this.setState({ state: 'done', message: data.message })
      window.scrollTo({
        top: this.formRef.current.offsetTop,
        behavior: 'smooth'
      })
    }
  }

  async handleLoginWithGoogleClick(response) {
    this.setState({ state: 'loading' })
    const tokenID = response.tokenId
    const email = response.profileObj.email
    const { success, data } = await api({
      resource: `/api/users/loginwithgoogle`,
      method: 'post',
      body: { email, tokenID },
      useAuth: false // login request should not have Authorization header
    })

    if (success === true) {
      setToken(data.token)
      this.props.auth.setAuth({
        email: data.email,
        exp: data.exp,
        token: data.token,
        user_id: data.user_id,
        user_role: data.user_role,
        permission: data.permission,
        loggedIn: true
      })
    } else {
      this.setState({ state: 'done', message: data.message })
      window.scrollTo({
        top: this.formRef.current.offsetTop,
        behavior: 'smooth'
      })
    }
  }

  handleLoginWithGoogleFail(response) {
    console.log(response.error)
    if (response.error === 'popup_closed_by_user') {
      this.setState({ state: 'done', message: 'Popup closed by user' })
    } else {
      this.setState({ state: 'done', message: response.error })
      window.scrollTo({
        top: this.formRef.current.offsetTop,
        behavior: 'smooth'
      })
    }
  }

  render() {
    const { message, success, email } = this.state
    if (this.props.auth.loggedIn) {
      let pathName = this.props.location.state
        ? this.props.location.state.from.pathname
        : '/forms'
      //can't allow to return editor, when changing accounts old accounts form can be redirected
      if (pathName.indexOf('editor') >= 0) {
        pathName = '/forms'
      }

      return (
        <Redirect
          to={{
            pathname: pathName,
            state: { from: this.props.location }
          }}
        />
      )
    }
    const capabilities = this.props.capabilities
    const signUpSuccess = capabilities.sendgridApiKey ? (
      <div>
        <div className="form-header">SIGNUP SUCCESS!</div>
        <div className="sign-up-success">
          <p>
            Signup success! We have sent an e-mail to your{' '}
            <span className="signup-email">
              <i>{email}</i>
            </span>{' '}
            address.
          </p>
          <p>
            Activate account by following that e-mail. (If you didn&apos;t
            recieve please check spam folder)
          </p>
        </div>
      </div>
    ) : (
      <div>
        <div className="form-header">SIGNUP SUCCESS!</div>
        <div className="sign-up-success">
          <div className="signup-email">
            <i>{email}</i>
          </div>
          <p>Signup success! You can now login to your account.</p>
        </div>
      </div>
    )

    return (
      <div className="login-wrapper">
        <div className="loginForm">
          <div className="picture-bg">
            <div className="login-picture">
              <LoginPicture />
            </div>
          </div>
          <div className="pale-border">
            {success ? (
              signUpSuccess
            ) : (
              <div>
                <div className="form-header">SIGNUP FORM</div>
                <form
                  ref={this.formRef}
                  onSubmit={this.handleSignUpButtonClick}>
                  <Renderer
                    className="form"
                    theme="infernal"
                    allowInternal={true}
                    handleFieldChange={this.handleFieldChange}
                    form={{
                      props: {
                        elements: [
                          {
                            id: 1,
                            type: 'TextBox',
                            label: 'Email',
                            value: this.state.email
                          },
                          {
                            id: 2,
                            type: 'Password',
                            label: 'Password'
                          },
                          {
                            id: 3,
                            type: 'Password',
                            label: 'Confirm Password'
                          },
                          {
                            id: 4,
                            type: 'Button',
                            buttonText: 'SIGN UP'
                          }
                        ]
                      }
                    }}
                  />
                </form>
                {capabilities.googleCredentialsClientID ? (
                  <div className="for-sign-up">
                    <div className="or-seperator">or</div>
                    <div className="google-sign-in">
                      <LoginWithGoogle
                        handleLoginWithGoogleButton={
                          this.handleLoginWithGoogleClick
                        }
                        handleLoginWithGoogleFail={
                          this.handleLoginWithGoogleFail
                        }
                      />
                    </div>
                  </div>
                ) : (
                  ''
                )}
                <p className="message-back">{message}</p>
                <div className="have-account">
                  Already have an account?
                  <Link to="/login">
                    <i>Login</i>
                  </Link>
                </div>
              </div>
            )}
            <div className="have-trouble">
              Having trouble?
              <span className="wip-placeholder" title="WIP">
                <a href="mailto:support@formpress.org">&nbsp;Contact us!</a>
              </span>
            </div>
          </div>
        </div>
        <div className="footer cw center grid">
          <div className="col-8-16">Copyright © 2021 formpress.org</div>
          <div className="col-8-16 tr">
            <a href="mailto:support@formpress.org">Contact</a>
          </div>
        </div>
      </div>
    )
  }
}

const SignUpWrapped = (props) => (
  <CapabilitiesContext.Consumer>
    {(capabilities) => (
      <AuthContext.Consumer>
        {(value) => (
          <SignUp {...props} auth={value} capabilities={capabilities} />
        )}
      </AuthContext.Consumer>
    )}
  </CapabilitiesContext.Consumer>
)

export default SignUpWrapped
