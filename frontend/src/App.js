import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
  Redirect
} from 'react-router-dom'

import Builder from './modules/Builder'
import Data from './modules/Data'
import Forms from './modules/Forms'
import Login from './modules/Login'
import SignUp from './modules/SignUp'
import AuthContext from './auth.context'
import CapabilitiesContext from './capabilities.context'
import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'
import Profile from './Profile'
import { api, setToken } from './helper'
import DownloadFile from './modules/helper/DownloadFile'
import VerifyEMail from './modules/helper/VerifyEmail'
import ForgotPassword from './modules/helper/ForgotPassword'
import ResetPassword from './modules/helper/ResetPassword'
import AdminPage from './modules/admin/AdminPage'

import { Logo } from './svg'

import './App.css'
import './style/themes/infernal.css'

const auth = window.localStorage.getItem('auth')
let initialAuthObject = {
  token: '',
  email: '',
  user_id: 0,
  user_role: 0,
  permission: {},
  exp: '',
  loggedIn: false
}

let capabilities = {
  googleServiceAccountCredentials: false,
  sendgridApiKey: false,
  googleCredentialsClientID: false,
  fileUploadBucket: false
}

if (auth !== null) {
  try {
    const authObject = JSON.parse(auth)

    if (authObject.exp * 1000 > new Date().getTime()) {
      initialAuthObject = authObject
      setToken(authObject.token)
    }
  } catch (e) {
    console.error('Error on parsing auth information from localStorage')
  }
}

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      ...initialAuthObject,
      capabilities
    }

    this.handleSetAuth = this.handleSetAuth.bind(this)
  }

  async componentDidMount() {
    const result = await api({
      resource: `/api/server/capabilities`,
      method: 'get'
    })
    const isEnvironmentVariableSet = result.data
    this.setState({ capabilities: isEnvironmentVariableSet })
  }

  handleSetAuth(
    { email, user_id, user_role, token, loggedIn, exp, permission },
    persist = true
  ) {
    this.setState({
      email,
      user_id,
      user_role,
      token,
      loggedIn,
      exp,
      permission
    })

    if (persist === true) {
      window.localStorage.setItem(
        'auth',
        JSON.stringify({
          email,
          user_id,
          user_role,
          token,
          loggedIn,
          exp,
          permission
        })
      )
    }
  }

  getAuthContextValue() {
    return {
      token: this.state.token,
      email: this.state.email,
      user_id: this.state.user_id,
      user_role: this.state.user_role,
      permission: this.state.permission,
      loggedIn: this.state.loggedIn,
      setAuth: this.handleSetAuth
    }
  }

  render() {
    const auth = this.getAuthContextValue()
    let homeUrl = undefined
    if (process.env.REACT_APP_HOMEURL !== '') {
      homeUrl = process.env.REACT_APP_HOMEURL
    }

    return (
      <Router>
        <CapabilitiesContext.Provider value={this.state.capabilities}>
          <AuthContext.Provider value={auth}>
            <div className="headerContainer">
              <div className="grid cw center">
                <div className="grid header">
                  <div className="col-1-16 logo">
                    <NavLink exact to="/">
                      <Logo />
                    </NavLink>
                  </div>
                  <div className="col-10-16 menu">
                    <nav className="nav">
                      <ul className="menu fl">
                        <li key="1">
                          {homeUrl !== undefined ? (
                            <a href={homeUrl}>Home</a>
                          ) : (
                            ''
                          )}
                        </li>
                        {auth.loggedIn === true
                          ? [
                              <li key="2">
                                <NavLink to="/forms" activeClassName="selected">
                                  Forms
                                </NavLink>
                              </li>,
                              <li key="3">
                                <NavLink
                                  to="/editor"
                                  activeClassName="selected">
                                  Editor
                                </NavLink>
                              </li>,
                              <li key="4">
                                <NavLink to="/data" activeClassName="selected">
                                  Data
                                </NavLink>
                              </li>
                            ]
                          : [
                              <li key="2">
                                <NavLink to="/login" activeClassName="selected">
                                  Login
                                </NavLink>
                              </li>,
                              <li key="3">
                                <NavLink
                                  to="/signup"
                                  activeClassName="selected">
                                  Sign Up
                                </NavLink>
                              </li>
                            ]}
                      </ul>
                    </nav>
                  </div>
                  <div className="col-5-16 profile_container">
                    <Profile />
                  </div>
                </div>
              </div>
            </div>
            <div className="content">
              <Switch>
                <PrivateRoute path="/forms">
                  <Forms />
                </PrivateRoute>
                <PrivateRoute
                  path="/editor/:formId/builder/question/:questionId/properties"
                  component={Builder}
                />
                <PrivateRoute path="/editor/:formId" component={Builder} />
                <PrivateRoute path="/editor" component={Builder} />
                <PrivateRoute path="/data">
                  <Data />
                </PrivateRoute>
                <Route path="/login" component={Login} />
                <Route path="/signup" component={SignUp} />
                <Route
                  path="/verify/:userId/:verificationCode"
                  component={VerifyEMail}
                />
                <PrivateRoute
                  path="/download/:formId/:submissionId/:questionId/:fileName"
                  component={DownloadFile}
                />
                <AdminRoute path="/admin" component={AdminPage} />
                <Route path="/forgotpassword" component={ForgotPassword} />
                <Route
                  path="/resetpassword/:userId/:passwordResetCode"
                  component={ResetPassword}
                />
                <Redirect to="/login" />
              </Switch>
            </div>
          </AuthContext.Provider>
        </CapabilitiesContext.Provider>
      </Router>
    )
  }
}

export default App
