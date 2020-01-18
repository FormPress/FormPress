import React, { Component } from 'react'

import Renderer from './Renderer'
import { api } from '../helper'

import './Login.css'

export default class Login extends Component {

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
    console.log('Field changed ', e)
    console.log('Field change ', elem)

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

  async handleLoginButtonClick () {
    console.log('Should login')
    this.setState({state: 'loading'})

    const { email, password } = this.state

    const { success, status, data } = await api({
      resource: `/api/users/login`,
      method: 'post',
      body: { email, password }
    })

    this.setState({ state: 'done', message: data.message })

    if (success === true) {
      console.log('LOGIN OK')
      
    } else {
      this.setState({ state: 'done', message: data.message })
      console.log('LOGIN FAIL')
    }

  }

  render () {
    const { message, state } = this.state

    return <div className='loginForm center'>
      <Renderer
        handleFieldChange={this.handleFieldChange}
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
                buttonText: 'Login',
                onClick: this.handleLoginButtonClick
              }
            ]
          }
        }}
      />
      <p>
        { (state === 'loading') ? 'Loading...' : null }
        { (state === 'done') ? message : null }
      </p>
    </div>  
  }
}
