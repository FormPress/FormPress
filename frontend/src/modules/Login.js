import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { Buffer } from 'buffer'
import { LoginPicture } from '../svg'
import Renderer from './Renderer'
import { api } from '../helper'
import GeneralContext from '../general.context'
import LoginWithGoogle from './helper/LoginWithGoogle'

import './Login.css'
import Footer from './helper/Footer'

class Login extends Component {
  constructor(props) {
    super(props)

    this.state = {
      email: '',
      password: '',
      message: '',
      state: 'initial' // one of, initial, loading, done
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleLoginButtonClick = this.handleLoginButtonClick.bind(this)
    this.handleLoginWithGoogleClick = this.handleLoginWithGoogleClick.bind(this)
    this.handleLoginWithGoogleFail = this.handleLoginWithGoogleFail.bind(this)
    this.handleRedirect = this.handleRedirect.bind(this)

    this.formRef = React.createRef()
  }

  handleRedirect() {
    const queryParams = new URLSearchParams(this.props.location.search)
    const encoded = queryParams.get('destination') || '/'

    const destination = decodeURIComponent(encoded)

    if (
      destination.startsWith('http://') ||
      destination.startsWith('https://')
    ) {
      window.location.href = destination
    } else {
      // Handle relative URLs
      const fullURL = `${window.location.protocol}//${window.location.host}${destination}`
      window.location.href = fullURL
    }
  }

  handleFieldChange(elem, e) {
    const stateKey = elem.id === 1 ? 'email' : elem.id === 2 ? 'password' : null

    if (stateKey === null) {
      return
    }

    this.setState({ [stateKey]: e.target.value })
  }

  async handleLoginButtonClick(e) {
    e.preventDefault()
    this.setState({ state: 'loading', message: 'Logging in...' })

    const { email, password } = this.state

    const { success, data } = await api({
      resource: `/api/users/login`,
      method: 'post',
      body: { email, password },
      useAuth: false // login request should not have Authorization header
    })

    this.setState({ state: 'done', message: data.message })

    if (success === true) {
      this.props.generalContext.auth.setAuth({
        email,
        name: data.name,
        exp: data.exp,
        user_id: data.user_id,
        user_role: data.user_role,
        role_name: data.role_name,
        permission: data.permission,
        admin: data.admin,
        loggedIn: true
      })

      const queryParams = new URLSearchParams(this.props.location.search)
      const destination = queryParams.get('destination')

      if (destination) {
        this.handleRedirect()
      }
    } else {
      this.setState({ state: 'done', message: data.message })
      window.scrollTo({
        top: this.formRef.current.offsetTop,
        behavior: 'smooth'
      })
    }
  }

  async handleLoginWithGoogleClick(response) {
    const toBeDecoded = response.credential.split('.')[1]
    const decoded = Buffer.from(toBeDecoded, 'base64').toString('utf-8')

    const profile = JSON.parse(decoded)

    this.setState({ state: 'loading', message: 'Logging in...' })
    const tokenID = response.credential
    const email = profile.email
    const { success, data } = await api({
      resource: `/api/users/loginwithgoogle`,
      method: 'post',
      body: { email, tokenID },
      useAuth: false // login request should not have Authorization header
    })

    if (success === true) {
      this.props.generalContext.auth.setAuth({
        email: data.email,
        exp: data.exp,
        token: data.token,
        user_id: data.user_id,
        user_role: data.user_role,
        role_name: data.role_name,
        permission: data.permission,
        admin: data.admin,
        loggedIn: true
      })

      const queryParams = new URLSearchParams(this.props.location.search)
      const destination = queryParams.get('destination')

      if (destination) {
        this.handleRedirect()
      }
    } else {
      this.setState({ state: 'done', message: data.message })
    }
  }

  handleLoginWithGoogleFail(response) {
    if (response.error === 'popup_closed_by_user') {
      this.setState({ state: 'done', message: 'Popup closed by user' })
    } else {
      this.setState({ state: 'done', message: response.error })
    }
  }

  render() {
    const { message, state } = this.state

    if (this.props.generalContext.auth.loggedIn === true) {
      let pathName = this.props.location.state
        ? this.props.location.state.from.pathname
        : '/forms'

      return (
        <Redirect
          to={{
            pathname: pathName,
            state: { from: this.props.location }
          }}
        />
      )
    }

    const { capabilities } = this.props.generalContext

    return (
      <>
        <link
          href="/customPublicStyling.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <div className="login-wrapper">
          <div className="loginForm bs-mild">
            <div className="wellcome-message">WELCOME BACK!</div>
            <div className="picture-bg">
              <div className="login-picture">
                <LoginPicture />
              </div>
            </div>
            <div className="login-mainContent">
              <div className="form-header">Login</div>
              <form ref={this.formRef} onSubmit={this.handleLoginButtonClick}>
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
                          label: 'Password',
                          value: this.state.password
                        },
                        {
                          id: 3,
                          type: 'Checkbox',
                          label: '',
                          options: ['Remember Me']
                        },
                        {
                          id: 4,
                          type: 'Button',
                          buttonText: 'LOGIN'
                        }
                      ]
                    }
                  }}
                />
              </form>
              {capabilities.sendgridApiKey ? (
                <div className="forgot-pass" title="forgot password">
                  <span className="forgot-pass-span">
                    <Link to="/forgotpassword">&nbsp;Forgot password?</Link>
                  </span>
                </div>
              ) : (
                ''
              )}
              {capabilities.googleCredentialsClientID ? (
                <div className="for-login">
                  <div className="or-seperator">or</div>
                  <div className="google-sign-in">
                    <LoginWithGoogle
                      context={'signin'}
                      disabled={false}
                      handleLoginWithGoogleButton={
                        this.handleLoginWithGoogleClick
                      }
                      handleLoginWithGoogleFail={this.handleLoginWithGoogleFail}
                    />
                  </div>
                </div>
              ) : (
                ''
              )}
              <p
                className={`message-back ${
                  state === 'done' ? 'isFilled' : 'empty'
                }`}>
                {state === 'done' ? message : null}
              </p>
              <div className="do-not-have" style={{ padding: 20 }}>
                As of 16/03/2025, we have disabled new signups. If you have an
                account, please login.
              </div>
              <div className="have-trouble">
                Having trouble?
                <a href={`mailto:support@${global.env.FE_EMAIL_DOMAIN}`}>
                  &nbsp;Contact us!
                </a>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </>
    )
  }
}

const LoginWrapped = (props) => (
  <GeneralContext.Consumer>
    {(value) => <Login {...props} generalContext={value} />}
  </GeneralContext.Consumer>
)

export default LoginWrapped
