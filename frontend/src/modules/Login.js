import React, { Component } from 'react'
import { Redirect, Link } from 'react-router-dom'

import { LoginPicture } from '../svg'
import Renderer from './Renderer'
import { api, setToken } from '../helper'
import AuthContext from '../auth.context'
import CapabilitiesContext from '../capabilities.context'
import LoginWithGoogle from './helper/LoginWithGoogle'

import './Login.css'

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
    this.setState({ state: 'loading' })

    const { email, password } = this.state

    const { success, data } = await api({
      resource: `/api/users/login`,
      method: 'post',
      body: { email, password },
      useAuth: false // login request should not have Authorization header
    })

    this.setState({ state: 'done', message: data.message })

    if (success === true) {
      setToken(data.token)
      this.props.auth.setAuth({
        email,
        name: data.name,
        exp: data.exp,
        token: data.token,
        user_id: data.user_id,
        user_role: data.user_role,
        permission: data.permission,
        loggedIn: true
      })
    } else {
      this.setState({ state: 'done', message: data.message })
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
    }
  }

  handleLoginWithGoogleFail(response) {
    console.log(response.error)
    if (response.error === 'popup_closed_by_user') {
      this.setState({ state: 'done', message: 'Popup closed by user' })
    } else {
      this.setState({ state: 'done', message: response.error })
    }
  }

  render() {
    const { message, state } = this.state

    if (this.props.auth.loggedIn === true) {
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

    return (
      <div className="login-wrapper">
        <div className="loginForm">
          <div className="wellcome-message">WELCOME BACK!</div>
          <div className="picture-bg">
            <div className="login-picture">
              <LoginPicture />
            </div>
          </div>
          <div className="pale-border">
            <div className="form-header">LOGIN FORM</div>
            <form onSubmit={this.handleLoginButtonClick}>
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
            <p className="message-back">
              {state === 'loading' ? 'Loading...' : null}
              {state === 'done' ? message : null}
            </p>
            {capabilities.sendgridApiKey ? (
              <div className="forgot-pass" title="WIP">
                <span className="forgot-pass-span">
                  <Link to="/forgotpassword">
                    &nbsp;<i>Forgot password?</i>
                  </Link>
                </span>
              </div>
            ) : (
              ''
            )}
            {capabilities.googleCredentialsClientID ? (
              <div>
                <div className="or-seperator">or</div>
                <div className="google-sign-in">
                  <LoginWithGoogle
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
            <div className="do-not-have">
              Don&apos;t have an account?{' '}
              <Link to="/signup">
                &nbsp;<i>SignUp</i>
              </Link>
            </div>
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

const LoginWrapped = (props) => (
  <CapabilitiesContext.Consumer>
    {(capabilities) => (
      <AuthContext.Consumer>
        {(value) => (
          <Login {...props} auth={value} capabilities={capabilities} />
        )}
      </AuthContext.Consumer>
    )}
  </CapabilitiesContext.Consumer>
)

export default LoginWrapped
