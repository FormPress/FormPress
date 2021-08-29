import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../helper'
import { LoginPicture } from '../svg'
import Renderer from './Renderer'
import AuthContext from '../auth.context'

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

    const { email, password } = this.state

    const simpleEmailRegex = /^\S{1,}@\S{2,}\.\S{2,}$/
    if (email === '') {
      this.setState({ message: 'Please use a valid email' })

      return
    } else if (simpleEmailRegex.exec(email) === null) {
      this.setState({ message: 'Please use a valid email' })

      return
    }

    if (password === '' || password !== this.state.passwordRe) {
      this.setState({ message: 'Password should match' })

      return
    }

    this.setState({ state: 'loading', message: 'Processing' })
    const { success, data } = await api({
      resource: `/api/users/signup`,
      method: 'post',
      body: { email, password }
    })

    if (success === true) {
      this.setState({ success: true, state: 'done', message: data.message })
    } else {
      this.setState({ state: 'done', message: data.message })
    }
  }

  render() {
    const { message, success, email } = this.state
    const signUpSuccess = (
      <div>
        <div className="sign-up-succes">
          Signup success! We have sent an e-mail to your {email} address.
          Activate account by following that e-mail. (If you didn&apos;t recieve
          please check spam folder)
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
                <form onSubmit={this.handleSignUpButtonClick}>
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
                            type: 'Text',
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
                <p className="message-back">{message}</p>
                <div className="have-account">
                  Already have an account?
                  <Link to="/login">
                    &nbsp;<i>Login</i>
                  </Link>
                </div>
                <div className="have-trouble">
                  Having trouble?
                  <span className="wip-placeholder" title="WIP">
                    Contact Us
                  </span>
                </div>
              </div>
            )}
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

const SignUpWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <SignUp {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default SignUpWrapped
