import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from 'react-router-dom'

import HomePage from './modules/HomePage'
import Builder from './modules/Builder'
import Data from './modules/Data'
import Forms from './modules/Forms'
import Login from './modules/Login'
import AuthContext from './auth.context'
import PrivateRoute from './PrivateRoute'
import Profile from './Profile'
import { setToken } from './helper'

import { Logo } from './svg'

import './App.css'
import './style/themes/infernal.css'

const auth = window.localStorage.getItem('auth')
let initialAuthObject = {
  token: '',
  name: '',
  email: '',
  user_id: 0,
  exp: '',
  loggedIn: false
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
      ...initialAuthObject
    }

    this.handleSetAuth = this.handleSetAuth.bind(this)
  }

  handleSetAuth(
    { name, email, user_id, token, loggedIn, exp },
    persist = true
  ) {
    this.setState({ name, email, user_id, token, loggedIn, exp })

    if (persist === true) {
      window.localStorage.setItem(
        'auth',
        JSON.stringify({ name, email, user_id, token, loggedIn, exp })
      )
    }
  }

  getAuthContextValue() {
    return {
      token: this.state.token,
      name: this.state.name,
      email: this.state.email,
      user_id: this.state.user_id,
      loggedIn: this.state.loggedIn,
      setAuth: this.handleSetAuth
    }
  }

  render() {
    const auth = this.getAuthContextValue()

    return (
      <Router>
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
                  <nav className="nav oh">
                    <ul className="menu fl">
                      {auth.loggedIn === true
                        ? [
                            <li key="1">
                              <NavLink exact to="/" activeClassName="selected">
                                Home
                              </NavLink>
                            </li>,
                            <li key="2">
                              <NavLink to="/forms" activeClassName="selected">
                                Forms
                              </NavLink>
                            </li>,
                            <li key="3">
                              <NavLink to="/editor" activeClassName="selected">
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
                            <li key="1">
                              <NavLink exact to="/" activeClassName="selected">
                                Home
                              </NavLink>
                            </li>,
                            <li key="2">
                              <NavLink to="/login" activeClassName="selected">
                                Login
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
              <Route exact path="/">
                <HomePage />
              </Route>
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
            </Switch>
          </div>
        </AuthContext.Provider>
      </Router>
    )
  }
}

export default App
