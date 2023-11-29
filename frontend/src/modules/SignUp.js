import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../helper'
import { LoginPicture } from '../svg'
import Renderer from './Renderer'
import LoginWithGoogle from './helper/LoginWithGoogle'
import VerificationInput from 'react-verification-input'

import GeneralContext from '../general.context'
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
      tosClicked: false,
      createdUser: null,
      timerDuration: 60,
      timerValue: 60,
      isTimerRunning: false,
      isResendDisabled: true,
      state: 'initial' // one of, initial, loading, done
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleTosClicked = this.handleTosClicked.bind(this)
    this.handleSignUpButtonClick = this.handleSignUpButtonClick.bind(this)
    this.handleLoginWithGoogleClick = this.handleLoginWithGoogleClick.bind(this)
    this.handleLoginWithGoogleFail = this.handleLoginWithGoogleFail.bind(this)
    this.renderSuccessFeedback = this.renderSuccessFeedback.bind(this)
    this.evaluateVerificationCode = this.evaluateVerificationCode.bind(this)
    this.startTimer = this.startTimer.bind(this)
    this.stopTimer = this.stopTimer.bind(this)
    this.handleResendClick = this.handleResendClick.bind(this)
    this.formRef = React.createRef()
  }

  startTimer() {
    this.setState({ isTimerRunning: true })
    this.timerInterval = setInterval(
      function () {
        const { timerValue } = this.state
        if (timerValue > 0) {
          this.setState((prevState) => ({
            timerValue: prevState.timerValue - 1
          }))
        } else {
          this.stopTimer()
        }
      }.bind(this),
      1000
    )
  }

  stopTimer() {
    clearInterval(this.timerInterval)
    this.setState({
      isTimerRunning: false,
      timerValue: this.state.timerDuration,
      isResendDisabled: false
    })
  }

  async handleResendClick() {
    this.setState({ isResendDisabled: true })
    this.startTimer()

    const { success } = await api({
      resource: `/api/users/${this.state.createdUser.user_id}/resendVerificationCode`,
      method: 'get'
    })

    if (success) {
      this.setState({ message: 'Verification code sent!' })
    }
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

  async handleTosClicked() {
    this.setState({ tosClicked: !this.state.tosClicked })
  }

  async handleSignUpButtonClick(e) {
    e.preventDefault()
    this.setState({ state: 'signup' })

    const { email, password } = this.state
    const { isCodeBasedSignUp } = this.props

    if (isCodeBasedSignUp) {
      this.startTimer()
    }

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

    this.setState({
      state: 'loading',
      message: isCodeBasedSignUp ? '' : 'Signing up...'
    })
    const { success, data } = await api({
      resource: `/api/users/signup`,
      method: 'post',
      body: { email, password, isCodeBasedSignUp }
    })

    if (success) {
      const { user } = data

      this.setState({
        success: true,
        state: 'done',
        message: isCodeBasedSignUp ? '' : data.message,
        createdUser: user
      })
    } else {
      this.setState({ state: 'done', message: data.message })
      window.scrollTo({
        top: this.formRef.current.offsetTop,
        behavior: 'smooth'
      })
    }
  }

  async handleLoginWithGoogleClick(response) {
    const { whoAmI } = this.props.generalContext.user
    const { compact } = this.props
    this.setState({ state: 'loading' })

    const profile = JSON.parse(atob(response.credential.split('.')[1]))

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
      // Compact mode is used for demo purposes, so we don't want to redirect the user to the dashboard
      compact === true ? this.props.demoToUserTransition() : whoAmI()
    } else {
      this.setState({ state: 'done', message: data.message })
      window.scrollTo({
        top: this.formRef.current.offsetTop,
        behavior: 'smooth'
      })
    }
  }

  handleLoginWithGoogleFail(response) {
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

  renderSuccessFeedback() {
    const {
      email,
      isResendDisabled,
      timerValue,
      isTimerRunning,
      loading,
      message
    } = this.state
    const { isCodeBasedSignUp } = this.props
    const { capabilities } = this.props.generalContext

    if (capabilities.sendgridApiKey !== true) {
      // Email capabilities are not enabled, so we can't send a verification email.
      return (
        <div>
          <div className="form-header">SIGN-UP SUCCESS!</div>
          <div className="sign-up-success">
            <div className="signup-email">
              <i>{email}</i>
            </div>
            <p>Sign-up successful! You can now log in to your account.</p>
          </div>
        </div>
      )
    }

    if (isCodeBasedSignUp === true) {
      return (
        <div>
          <div className="form-header">SIGN-UP SUCCESS!</div>
          <div className="sign-up-success">
            <p>
              We have sent a verification code to the address{' '}
              <span className="signup-email">
                <i>{email}</i>
              </span>{' '}
              .
            </p>
            <VerificationInput
              length={6}
              placeholder={'·'}
              onComplete={(value) => {
                this.evaluateVerificationCode(value)
              }}
              classNames={{
                container: loading ? 'viContainer--loading' : 'viContainer',
                character: 'viCharacter',
                characterInactive: 'viCharacter--inactive',
                characterSelected: 'viCharacter--selected'
              }}></VerificationInput>
            <div className="resend-verification">
              <span className="did-not-receive"> Did not receive?</span>
              <button
                className="resend-button"
                onClick={this.handleResendClick}
                disabled={isResendDisabled}>
                {isTimerRunning
                  ? `Resend in ${timerValue} seconds`
                  : 'Resend Verification Code'}
              </button>
              <p
                className={`message-back ${
                  message === '' ? 'empty' : 'isFilled'
                }`}>
                {message}
              </p>
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <div className="form-header">SIGN-UP SUCCESS!</div>
          <div className="sign-up-success">
            <p>
              We have sent a verification e-mail to the address{' '}
              <span className="signup-email">
                <i>{email}</i>
              </span>{' '}
              .
            </p>
            <p>
              Please activate your account to begin your journey with FormPress.
              (If you didn&apos;t receive the e-mail, please check your spam
              folder)
            </p>
          </div>
        </div>
      )
    }
  }

  async evaluateVerificationCode(value) {
    this.setState({ state: 'loading', message: 'Validating...' })

    const code = value.toLowerCase()

    const { success } = await api({
      resource: `/api/users/${this.state.createdUser.user_id}/verify/${code}?codeBasedSignUp=1`,
      method: 'get'
    })

    if (success) {
      this.props.demoToUserTransition()
    } else {
      this.setState({ state: 'done', message: 'Invalid verification code' })
    }
  }

  render() {
    const { message, success } = this.state
    const { compact } = this.props
    const { capabilities } = this.props.generalContext

    return (
      <>
        {compact ? (
          ''
        ) : (
          <link
            href="/customPublicStyling.css"
            rel="stylesheet"
            crossOrigin="anonymous"
          />
        )}
        <div className="login-wrapper">
          <div className="loginForm signupForm bs-mild">
            <div className="picture-bg">
              <div className="login-picture">
                <LoginPicture />
              </div>
            </div>
            <div className="signup-mainContent">
              {success ? (
                this.renderSuccessFeedback()
              ) : (
                <div>
                  <div className="form-header">Sign up</div>
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
                              buttonText: 'SIGN UP',
                              disabled: !this.state.tosClicked
                            }
                          ]
                        }
                      }}
                    />
                  </form>
                  <div className="tosContainer">
                    <input
                      id="toscheckbox"
                      type="checkbox"
                      name="toscheckbox"
                      onChange={() => this.handleTosClicked()}
                    />{' '}
                    <label htmlFor="toscheckbox">
                      {' '}
                      I accept and agree to the{' '}
                    </label>
                    <a
                      target="_blank"
                      href="https://formpress.org/tos"
                      rel="noopener noreferrer">
                      Terms of Use
                    </a>
                    .
                  </div>

                  {capabilities.googleCredentialsClientID ? (
                    <div className="for-sign-up">
                      <div className="or-seperator">or</div>
                      <div className="google-sign-in">
                        <LoginWithGoogle
                          context={'signup'}
                          disabled={!this.state.tosClicked}
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
                  <p
                    className={`message-back ${
                      message === '' ? 'empty' : 'isFilled'
                    }`}>
                    {message}
                  </p>
                  <div className="have-account">
                    Already have an account?
                    <Link to="/login">&nbsp;LOGIN</Link>
                  </div>
                </div>
              )}
              <div className="have-trouble">
                Having trouble?
                <a href={`mailto:support@${global.env.FE_EMAIL_DOMAIN}`}>
                  &nbsp;Contact us!
                </a>
              </div>
            </div>
          </div>

          {compact ? (
            ''
          ) : (
            <div className="footer cw center grid">
              <div className="col-8-16">Copyright © 2023 formpress.org</div>
              <div className="col-8-16 tr">
                <a href={`mailto:support@${global.env.FE_EMAIL_DOMAIN}`}>
                  Contact
                </a>
              </div>
            </div>
          )}
        </div>
      </>
    )
  }
}

const SignUpWrapped = (props) => (
  <GeneralContext.Consumer>
    {(value) => <SignUp {...props} generalContext={value} />}
  </GeneralContext.Consumer>
)

export default SignUpWrapped
