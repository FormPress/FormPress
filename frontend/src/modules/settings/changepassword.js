import React, { Component } from 'react'
import { api } from '../../helper'
import Renderer from '../Renderer'

export default class ChangePassword extends Component {
  static componentName = 'changePassword'
  static path = '/settings/changepassword'
  static menuText = 'Change Password'

  constructor(props) {
    super(props)

    this.state = {
      situation: 'init',
      message: '',
      current_password: '',
      new_password: '',
      new_password_again: ''
    }
  }

  handleFieldChange = (elem, e) => {
    const stateKey =
      elem.id === 1
        ? 'current_password'
        : elem.id === 2
        ? 'new_password'
        : elem.id === 3
        ? 'new_password_again'
        : null

    if (stateKey === null) {
      return
    }

    this.setState({ [stateKey]: e.target.value })
  }

  handleResetButtonClick = async (e) => {
    e.preventDefault()

    const { current_password, new_password, new_password_again } = this.state

    if (current_password === '') {
      this.setState({ message: 'Current Password field cannot be left blank.' })

      return
    }

    if (new_password === '' || new_password !== new_password_again) {
      this.setState({ message: 'New Password fields should match.' })

      return
    }

    this.setState({ situation: 'loading', message: 'Processing' })

    const { success, data } = await api({
      resource: '/api/users/changepassword/',
      method: 'post',
      body: { current_password, new_password }
    })

    if (success === true) {
      this.setState({ situation: 'success', message: data.message })
    } else {
      this.setState({ situation: 'fail', message: data.message })
    }
  }
  render() {
    const { message, situation } = this.state

    const changeSuccess = (
      <div>
        <div>You successfully changed your password.</div>
      </div>
    )

    return (
      <div className="login-wrapper">
        <div className="loginForm">
          <div className="pale-border">
            <div>
              <div className="form-header">RESET PASSWORD</div>
              {situation === 'success' ? (
                changeSuccess
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
                            key: 1,
                            type: 'Password',
                            label: 'Current Password',
                            value: this.state.current_password
                          },
                          {
                            id: 2,
                            key: 2,
                            type: 'Password',
                            label: 'New Password',
                            value: this.state.new_password
                          },
                          {
                            id: 3,
                            key: 3,
                            type: 'Password',
                            label: 'New Password Again',
                            value: this.state.new_password_again
                          },
                          {
                            id: 4,
                            key: 4,
                            type: 'Button',
                            buttonText: 'CHANCE PASSWORD'
                          }
                        ]
                      }
                    }}
                  />
                </form>
              )}
              <p className="message-back">{message}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
