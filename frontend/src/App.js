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
import AuthContext from './auth.context'
import PrivateRoute from './PrivateRoute'
import Profile from './Profile'

import './App.css'

const auth = window.localStorage.getItem('auth')
let initialAuthObject = {
  token: '',
  email: '',
  exp: '',
  loggedIn: false
}

if (auth !== null) {
  try {
    const authObject = JSON.parse(auth)

    if ((authObject.exp * 1000) > (new Date().getTime())) {
      initialAuthObject = authObject
    }
  } catch (e) {
    console.error('Error on parsing auth information from localStorage')
  }
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      ...initialAuthObject
    }

    this.handleSetAuth = this.handleSetAuth.bind(this)
  }

  handleSetAuth ({ email, token, loggedIn, exp }, persist = true) {
    this.setState({ email, token, loggedIn, exp })

    if (persist === true) {
      window.localStorage.setItem('auth', JSON.stringify(
        { email, token, loggedIn, exp }
      ))  
    }
  }

  getAuthContextValue () {
    return {
      token: this.state.token,
      email: this.state.email,
      loggedIn: this.state.loggedIn,
      setAuth: this.handleSetAuth
    }
  }

  render () {
    return (
      <Router>
      <AuthContext.Provider value={this.getAuthContextValue()}>
        <div>
          <nav className='nav oh'>
            <ul className='menu fl'>
              <li>
                <NavLink exact to='/' activeClassName='selected'>Home</NavLink>
              </li>
              <li>
                <NavLink to='/forms' activeClassName='selected'>Forms</NavLink>
              </li>
              <li>
                <NavLink to='/editor' activeClassName='selected'>Editor</NavLink>
              </li>
              <li>
                <NavLink to='/data' activeClassName='selected'>Data</NavLink>
              </li>
            </ul>
            <div className='fr profile_container'>
              <Profile />
            </div>
          </nav>

          <Switch>
            <Route exact path="/">
              <h1>Welcome to FormPress</h1>
            </Route>
            <PrivateRoute path="/forms">
              <Forms />
            </PrivateRoute>
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
