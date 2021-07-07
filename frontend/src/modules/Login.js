import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import { LoginPicture } from '../svg'
import Renderer from './Renderer'
import { api, setToken } from '../helper'
import AuthContext from '../auth.context'

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
        loggedIn: true
      })
    } else {
      this.setState({ state: 'done', message: data.message })
    }
  }

  render() {
    const { message, state } = this.state

    if (this.props.auth.loggedIn === true) {
      const pathName = this.props.location.state
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
            <div className="forgot-pass" title="WIP">
              <span className="wip-placeholder" title="WIP">
                Forgot password?
              </span>
            </div>
            <div className="or-seperator">or</div>
            <div className="google-sign-in">
              <button className="google-sign-in-button" type="button">
                Signin via Google
              </button>
            </div>
            <div className="do-not-have">
              Don&apos;t have an account?{' '}
              <span className="wip-placeholder" title="WIP">
                Signup
              </span>
            </div>
            <div className="have-trouble">
              Having trouble?
              <span className="wip-placeholder" title="WIP">
                Contact Us
              </span>
            </div>
          </div>
        </div>
        <div className="footer cw center grid">
          <div className="col-8-16">Copyright © 2020 formpress.org</div>
          <div className="col-8-16 tr">
            <a href="mailto:support@formpress.org">Contact</a>
          </div>
        </div>
      </div>
    )
  }
}

const LoginWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Login {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default LoginWrapped
