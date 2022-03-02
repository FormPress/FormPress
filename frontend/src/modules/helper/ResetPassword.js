import React, { Component } from 'react'
import { api } from '../../helper'
import { LoginPicture } from '../../svg'
import { Link } from 'react-router-dom'
import Renderer from '../Renderer'
import AuthContext from '../../auth.context'

class ResetPassword extends Component {
  constructor(props) {
    super(props)

    this.state = {
      message: 'Loading',
      email: '',
      situation: 'init',
      codeCorrect: false
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleResetButtonClick = this.handleResetButtonClick.bind(this)
  }

  handleFieldChange(elem, e) {
    const stateKey =
      elem.id === 1 ? 'password' : elem.id === 2 ? 'passwordRe' : null

    if (stateKey === null) {
      return
    }

    this.setState({ [stateKey]: e.target.value })
  }

  async handleResetButtonClick(e) {
    e.preventDefault()

    const { password } = this.state

    if (password === '' || password !== this.state.passwordRe) {
      this.setState({ message: 'Password should match' })

      return
    }

    this.setState({ situation: 'loading', message: 'Processing' })

    const { success, data } = await api({
      resource: `/api/users/${this.props.match.params.userId}/resetpassword/${this.props.match.params.passwordResetCode}`,
      method: 'post',
      body: { password }
    })

    if (success === true) {
      this.setState({ situation: 'success', message: data.message })
    } else {
      this.setState({ situation: 'fail', message: data.message })
    }
  }
  render() {
    const { message, situation } = this.state

    const resetSuccess = (
      <div>
        <div>
          You successfully changed your password. You can
          <Link to="/login">
            &nbsp;<i>login</i>
          </Link>{' '}
          using your new password.
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
            <div>
              <div className="form-header">RESET PASSWORD</div>
              {situation === 'success' ? (
                resetSuccess
              ) : (
                <form onSubmit={this.handleResetButtonClick}>
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
                            type: 'Password',
                            label: 'Password',
                            value: this.state.password
                          },
                          {
                            id: 2,
                            type: 'Password',
                            label: 'Confirm Password'
                          },
                          {
                            id: 3,
                            type: 'Button',
                            buttonText: 'RESET PASSWORD'
                          }
                        ]
                      }
                    }}
                  />
                </form>
              )}
              <p className="message-back">{message}</p>
              <div className="have-trouble">
                Having trouble?
                <span className="wip-placeholder" title="WIP">
                  <a href="mailto:support@formpress.org">&nbsp;Contact us!</a>
                </span>
              </div>
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
const ResetPasswordWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <ResetPassword {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default ResetPasswordWrapped
