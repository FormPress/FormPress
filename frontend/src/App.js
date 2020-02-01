import React, { Component } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from 'react-router-dom'

import Builder from './modules/Builder'
import Data from './modules/Data'
import Forms from './modules/Forms'
import Login from './modules/Login'
import AuthContext from './auth.context'
import PrivateRoute from './PrivateRoute'
import Profile from './Profile'
import { setToken } from './helper'

import './App.css'

const auth = window.localStorage.getItem('auth')
let initialAuthObject = {
  token: '',
  email: '',
  user_id: 0,
  exp: '',
  loggedIn: false
}

if (auth !== null) {
  try {
    const authObject = JSON.parse(auth)

    if ((authObject.exp * 1000) > (new Date().getTime())) {
      initialAuthObject = authObject
      setToken(authObject.token)
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

  handleSetAuth ({ email, user_id, token, loggedIn, exp }, persist = true) {
    this.setState({ email, user_id, token, loggedIn, exp })

    if (persist === true) {
      window.localStorage.setItem('auth', JSON.stringify(
        { email, user_id, token, loggedIn, exp }
      ))  
    }
  }

  getAuthContextValue () {
    return {
      token: this.state.token,
      email: this.state.email,
      user_id: this.state.user_id,
      loggedIn: this.state.loggedIn,
      setAuth: this.handleSetAuth
    }
  }

  render () {
    const auth = this.getAuthContextValue()

    return (
      <Router>
      <AuthContext.Provider value={ auth }>
        <div>
          <nav className='nav oh'>
            <ul className='menu fl'>
              { (auth.loggedIn === true)
                  ? [
                    <li key='1'>
                      <NavLink exact to='/' activeClassName='selected'>
                        Home
                      </NavLink>
                    </li>,
                    <li key='2'>
                      <NavLink to='/forms' activeClassName='selected'>
                        Forms
                      </NavLink>
                    </li>,
                    <li key='3'>
                      <NavLink to='/editor' activeClassName='selected'>
                        Editor
                      </NavLink>
                    </li>,
                    <li key='4'>
                      <NavLink to='/data' activeClassName='selected'>
                        Data
                      </NavLink>
                    </li>
                  ]
                  : <li>
                      <NavLink to='/login' activeClassName='selected'>
                        Login
                      </NavLink>
                  </li>
              }
            </ul>
            <div className='fr profile_container'>
              <Profile />
            </div>
          </nav>
          <Switch>
            <Route exact path='/'>
              <div className='homepage'>
                <h1>Welcome to FormPress</h1>
              </div>
            </Route>
            <PrivateRoute path='/forms'>
              <Forms />
            </PrivateRoute>
            <PrivateRoute path='/editor/:formId' component={Builder} />
            <PrivateRoute path='/editor' component={Builder} />
            <PrivateRoute path='/data'>
              <Data />
            </PrivateRoute>
            <Route path='/login' component={Login} />
          </Switch>
        </div>
      </AuthContext.Provider>
      </Router>
    )
  }
}

export default App
