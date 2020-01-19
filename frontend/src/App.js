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

import './App.css'

const PrivateRoute = ({ children, component, ...rest }) => {
  return (
    <AuthContext.Consumer>
      {(value) => 
        <Route
          {...rest}
          render={(props) => {
            const Component = component

            return (value.loggedIn === true) ? (
              (component !== undefined) ? <Component { ...props } /> : children
            ) : (
              <Redirect
                to={{
                  pathname:'/login',
                  state: { from: props.location }
                }}
              />
            )
          }
            
          } 
        />
      }
    </AuthContext.Consumer>
  )
}

class App extends Component {
  componentDidMount () {
    const token = window.localStorage.getItem('token')

    if (token !== null) { // TODO check if token will expire soon
      this.setState({
        token,
        loggedIn: true
      })
    }
  }
  constructor (props) {
    super(props)
    this.state = {
      token: '',
      email: '',
      loggedIn: false
    }

    this.handleSetAuth = this.handleSetAuth.bind(this)

    // setTimeout(() => {
    //   this.setState({token: ''})
    // }, 2000)
  }

  handleSetAuth ({ email, token, loggedIn }) {
    this.setState({ email, token, loggedIn })

    window.localStorage.setItem('token', token)
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
          <nav className='nav'>
            <ul>
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
            <Route path="/login">
              <h1>Login Here</h1>
              <Login />
            </Route>
          </Switch>
        </div>
      </AuthContext.Provider>
      </Router>
    )
  }
}

export default App
