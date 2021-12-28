import React, { Component } from 'react'
import { api } from '../../helper'
import { LoginPicture } from '../../svg'
import { Link } from 'react-router-dom'
import AuthContext from '../../auth.context'

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
        situation: 'succes',
        message: 'E-mail verified!',
        success: true
      })
    }
  }

  render() {
    const { success, message, situation } = this.state

    const verificationInit = (
      <div>
        <div>Please wait a moment while we verify your e-mail address.</div>
      </div>
    )

    const verificationFail = (
      <div>
        <div>There seems to be a problem. {message}</div>
      </div>
    )

    const verificationSuccess = (
      <div>
        <div>
          Your account have verified. You can
          <Link to="/login">
            &nbsp;<i>login</i>
          </Link>{' '}
          using your verified e-mail address.
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
const VerifyEmailWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <VerifyEMail {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default VerifyEmailWrapped
