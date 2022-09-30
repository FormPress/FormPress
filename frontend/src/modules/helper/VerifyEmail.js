import React, { Component } from 'react'
import { api } from '../../helper'
import { LoginPicture } from '../../svg'
import { Link } from 'react-router-dom'
import GeneralContext from '../../general.context'

class VerifyEMail extends Component {
  constructor(props) {
    super(props)

    this.state = {
      message: 'Loading',
      email: '',
      situation: 'init',
      success: false
    }
  }

  async componentDidMount() {
    const resource = `/api/users/${this.props.match.params.userId}/verify/${this.props.match.params.verificationCode}`
    const { status, data } = await api({
      resource: resource
    })

    if (status !== 200) {
      this.setState({ situation: 'fail', message: data.message })
    } else {
      this.setState({
        situation: 'success',
        message: 'E-mail verified!',
        success: true
      })
    }
  }

  render() {
    const { success, message, situation } = this.state

    const verificationInit = (
      <div className="verification_back">
        <div>Please wait a moment while we verify your e-mail address.</div>
      </div>
    )

    const verificationFail = (
      <div className="verification_back">
        <div>There seems to be a problem. {message}</div>
      </div>
    )

    const verificationSuccess = (
      <div className="verification_back">
        <div>
          Your account has been verified. You can now
          <Link to="/login">
            &nbsp;<i>log in</i>
          </Link>{' '}
          with your e-mail.
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
              <div className="form-header">VERIFY E-MAIL</div>
              {situation === 'init'
                ? verificationInit
                : success
                ? verificationSuccess
                : verificationFail}
              <p className={`message-back ${this.state.situation}`}>
                {message}
              </p>
              <div className="have-account">
                Already have an account?
                <Link to="/login">
                  &nbsp;<i>Login</i>
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
        </div>
        <div className="footer cw center grid">
          <div className="col-8-16">Copyright © 2022 formpress.org</div>
          <div className="col-8-16 tr">
            <a href="mailto:support@formpress.org">Contact</a>
          </div>
        </div>
      </div>
    )
  }
}
const VerifyEmailWrapped = (props) => (
  <GeneralContext.Consumer>
    {(value) => <VerifyEMail {...props} generalContext={value} />}
  </GeneralContext.Consumer>
)

export default VerifyEmailWrapped
