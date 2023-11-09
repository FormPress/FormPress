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
import DownloadFile from './modules/helper/DownloadFile'
import VerifyEMail from './modules/helper/VerifyEmail'
import ForgotPassword from './modules/helper/ForgotPassword'
import ResetPassword from './modules/helper/ResetPassword'
import Settings from './modules/helper/Settings'
import AdminPage from './modules/admin/AdminPage'
import Profile from './Profile'
import NotFoundPage from './modules/common/NotFoundPage'
import ReadCallback from './modules/common/ReadCallback'

import PrivateRoute from './PrivateRoute'
import AdminRoute from './AdminRoute'

import { api } from './helper'

import GeneralContext from './general.context'

import { Logo, FPLoader } from './svg'

import './App.css'
import './style/themes/scss/index.scss'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      capabilities: {},
      user: { getUsages: this.getUsages, whoAmI: this.whoAmI },
      loading: true,
      hMenuOpen: false
    }

    this.handleSetAuth = this.handleSetAuth.bind(this)
  }

  async componentDidMount() {
    await this.loadEnvVars()
    await this.loadCapabilities()

    await this.whoAmI()

    await this.getUsages()

    // This is to prevent re-rendering of the app component during the calls above.
    this.setState({ loading: false })
  }

  getUsages = async () => {
    if (this.state.user_id) {
      const { user } = this.state
      const { data } = await api({
        resource: `/api/users/${this.state.user_id}/usages`,
        method: 'get'
      })
      user.usages = data
      this.setState({ user })
    }
  }

  whoAmI = async (renewCookie = false) => {
    let endpoint = `/api/users/me`

    if (renewCookie) {
      endpoint = `/api/users/me?renewCookie=true`
    }

    const { data } = await api({
      resource: endpoint
    })

    if (data.status === 'done') {
      const incomingAuthObject = data.auth

      incomingAuthObject.loggedIn = true

      this.handleSetAuth(incomingAuthObject)
    }

    this.setState({ meCompleted: true })
  }

  //load env vars
  loadEnvVars = async () => {
    try {
      const response = await api({
        resource: `/api/loadvariables`,
        useAuth: false
      })
      for (const [key, value] of Object.entries(response.data)) {
        global.env[key] = value
      }
    } catch (e) {
      console.log('Error loading variables')
    }
  }

  loadCapabilities = async () => {
    try {
      const capabilitiesResult = await api({
        resource: `/api/server/capabilities`,
        method: 'get',
        useAuth: false
      })

      const capabilities = capabilitiesResult.data

      this.setState({ capabilities })
    } catch (e) {
      console.log('Error loading capabilities')
    }
  }

  handleSetAuth({
    email = this.state.email,
    user_id = this.state.user_id,
    user_role = this.state.user_role,
    role_name = this.state.role_name,
    impersonate = this.state.impersonate,
    admin = this.state.admin,
    loggedIn = this.state.loggedIn,
    exp = this.state.exp,
    permission = this.state.permission
  }) {
    const auth = {
      email,
      user_id,
      user_role,
      role_name,
      impersonate,
      admin,
      loggedIn,
      exp,
      permission
    }

    this.setState(auth)
  }

  getAuthContextValue() {
    return {
      impersonate: this.state.impersonate,
      email: this.state.email,
      user_id: this.state.user_id,
      user_role: this.state.user_role,
      role_name: this.state.role_name,
      permission: this.state.permission,
      admin: this.state.admin,
      loggedIn: this.state.loggedIn,
      setAuth: this.handleSetAuth
    }
  }

  toggleHMenu = () => {
    this.setState({ hMenuOpen: !this.state.hMenuOpen })
  }

  render() {
    const auth = this.getAuthContextValue()

    const generalContext = {
      auth,
      capabilities: this.state.capabilities,
      user: this.state.user
    }

    let homeUrl = undefined
    if (global.env.FE_HOMEURL !== '' || global.env.FE_HOMEURL !== undefined) {
      homeUrl = global.env.FE_HOMEURL
    }

    let redirectPage = <Redirect to="/login" />

    // TODO: fix this, temporarily disabled
    if (auth.loggedIn === true) {
      redirectPage = <Redirect path="*" to="/404" />
    }

    if (this.state.loading) {
      return (
        <div className="loading-logo">
          <FPLoader />
        </div>
      )
    }

    return (
      <Router>
        <GeneralContext.Provider value={generalContext}>
          <header
            className={'header' + (auth.loggedIn === true ? ' loggedIn' : '')}>
            <div className="header-center">
              <NavLink exact to="/" className={'logo'}>
                <Logo />
              </NavLink>
              <input
                className="menu-btn"
                type="checkbox"
                id="menu-btn"
                checked={this.state.hMenuOpen}
                onClick={this.toggleHMenu}
              />
              <label className="menu-icon" htmlFor="menu-btn">
                <span className="navicon"></span>
              </label>
              <ul className={'menu' + (auth.loggedIn === true ? ' rich' : '')}>
                <li key="1">
                  {homeUrl !== undefined ? <a href={homeUrl}>Home</a> : ''}
                </li>
                {auth.loggedIn === true
                  ? [
                      <li key="2">
                        <NavLink
                          to="/forms"
                          activeClassName="selected"
                          onClick={this.toggleHMenu}>
                          Forms
                        </NavLink>
                      </li>,
                      <li key="3" onClick={this.toggleHMenu}>
                        <NavLink
                          to="/editor"
                          activeClassName="selected"
                          onClick={this.toggleHMenu}>
                          Editor
                        </NavLink>
                      </li>,
                      <li key="4">
                        <NavLink
                          to="/data"
                          activeClassName="selected"
                          onClick={this.toggleHMenu}>
                          Data
                        </NavLink>
                      </li>,
                      <>
                        <Profile
                          generalContext={generalContext}
                          compact={true}
                          toggleHMenu={this.toggleHMenu}
                        />
                      </>
                    ]
                  : [
                      <li key="2">
                        <NavLink
                          to="/login"
                          activeClassName="selected"
                          onClick={this.toggleHMenu}>
                          Login
                        </NavLink>
                      </li>,
                      <li key="3">
                        <NavLink
                          to="/signup"
                          activeClassName="selected"
                          onClick={this.toggleHMenu}>
                          Sign Up
                        </NavLink>
                      </li>
                    ]}
              </ul>
              <div className="profile_container">
                <Profile generalContext={generalContext} />
              </div>
            </div>
          </header>

          <div
            className={'content' + (auth.loggedIn === true ? ' loggedIn' : '')}>
            <div
              id="mobile-warning"
              onClick={(e) => {
                // Hide self
                e.target.style.display = 'none'
              }}>
              <p>
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="fa-question"
                />{' '}
                FormPress currently offers the best experience on desktop
                devices. Tap here to dismiss this message.
              </p>
            </div>
            <Switch>
              <PrivateRoute exact path="/">
                <Redirect to="/forms" />
              </PrivateRoute>

              <PrivateRoute exact strict path="/forms" component={Forms} />
              <PrivateRoute
                exact
                path="/editor/:formId/builder/question/:questionId/properties"
                component={Builder}
              />
              <PrivateRoute path="/editor/:formId" component={Builder} />
              <PrivateRoute
                exact
                path="/editor/:formId/builder"
                component={Builder}
              />
              <PrivateRoute
                exact
                path="/editor/:formId/design"
                component={Builder}
              />
              <PrivateRoute
                exact
                path="/editor/:formId/preview"
                component={Builder}
              />
              <PrivateRoute
                exact
                path="/editor/:formId/share"
                component={Builder}
              />
              <PrivateRoute
                exact
                path="/editor/:formId/builder/properties"
                component={Builder}
              />
              <PrivateRoute
                exact
                path="/editor/:formId/builder/integrations"
                component={Builder}
              />
              <PrivateRoute exact path="/editor" component={Builder} />
              <PrivateRoute exact strict path="/data" component={Data} />
              <PrivateRoute
                exact
                strict
                path="/data/statistics"
                component={Data}
              />
              <PrivateRoute path="/settings" component={Settings} />

              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={SignUp} />

              <Route
                path="/verify/:userId/:verificationCode"
                component={VerifyEMail}
              />
              <PrivateRoute
                path="/download/:formId/:submissionId/:questionId/:fileName"
                component={DownloadFile}
              />
              <AdminRoute path="/admin" component={AdminPage} />
              <Route exact path="/forgotpassword" component={ForgotPassword} />
              <Route
                path="/resetpassword/:userId/:passwordResetCode"
                component={ResetPassword}
              />

              <Route path="/read/development" component={ReadCallback} />
              <Route path="/404" component={NotFoundPage} />
              {redirectPage}
            </Switch>
          </div>
        </GeneralContext.Provider>
      </Router>
    )
  }
}

export default App
