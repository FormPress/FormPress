import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import Renderer from './Renderer'
import { api, setToken } from '../helper'
import AuthContext from '../auth.context'

import './Login.css'

class Login extends Component {

  constructor (props) {
    super(props)

    this.state = {
      email: '',
      password: '',
      message: '',
      state: 'initial' // one of, initial, loading, done
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleLoginButtonClick = this.handleLoginButtonClick.bind(this)
  }

  handleFieldChange (elem, e) {
    const stateKey = (elem.id === 1)
      ? 'email'
      : (elem.id === 2)
        ? 'password'
        : null


    if (stateKey === null) {
      return
    }

    this.setState({[stateKey]: e.target.value})
  }

  async handleLoginButtonClick (e) {
    e.preventDefault()
    this.setState({state: 'loading'})

    const { email, password } = this.state

    const { success, data } = await api({
      resource: `/api/users/login`,
      method: 'post',
      body: { email, password },
      useAuth: false // login request should not have Authorization header
    })

    this.setState({ state: 'done', message: data.message })

    if (success === true) {
      console.log('LOGIN OK')
      setToken(data.token)
      this.props.auth.setAuth({
        email,
        exp: data.exp,
        token: data.token,
        user_id: data.user_id,
        loggedIn: true
      })
    } else {
      this.setState({ state: 'done', message: data.message })
      console.log('LOGIN FAIL')
    }

  }

  render () {
    const { message, state } = this.state

    if (this.props.auth.loggedIn === true) {
      return <Redirect
        to={{
          pathname: '/forms',
          state: { from: this.props.location }
        }} 
      />
    }

    return <div className='loginForm'>
      <form onSubmit={ this.handleLoginButtonClick }>
        <Renderer
          handleFieldChange={ this.handleFieldChange }
          form={{
            props: {
              elements: [
                {
                  id: 1,
                  type: 'Text',
                  label: 'Email',
                  value: this.state.email
                },
                {
                  id: 2,
                  type: 'Text',
                  label: 'Password',
                  value: this.state.password
                },
                {
                  id: 2,
                  type: 'Button',
                  buttonText: 'Login'
                }
              ]
            }
          }}
        />
      </form>
      <p>
        { (state === 'loading') ? 'Loading...' : null }
        { (state === 'done') ? message : null }
      </p>
    </div>  
  }
}



const LoginWrapped = (props) => 
  <AuthContext.Consumer>
    {
      (value) => <Login { ...props } auth={ value } />
    }
  </AuthContext.Consumer>

export default LoginWrapped
