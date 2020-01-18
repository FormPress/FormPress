import React, { Component } from 'react'

import { api } from '../helper'
import { Link } from 'react-router-dom'

import './Forms.css'

const user_id = 1

export default class Forms extends Component {
  setLoadingState (key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async updateForms () {
    this.setLoadingState('forms', true)

    const { data } = await api({
      resource: `/api/users/${user_id}/forms`
    })

    const forms = data.map((form) => {
      return {
        ...form,
        props: JSON.parse(form.props) 
      }
    })

    this.setLoadingState('forms', false)
    this.setState({ forms })
  }

  componentDidMount () {
    this.updateForms()
  }

  constructor (props) {
    super(props)
    this.state = {
      forms: [],
      loading: {
        forms: false,
        deletingId: false
      }
    }
    
    this.handleFormDeleteClick = this.handleFormDeleteClick.bind(this)
  }

  async handleFormDeleteClick (form, e) {
    e.preventDefault()

    this.setState({
      loading: {
        ...this.state.loading,
        deletingId: form.id
      }
    })

    await api({
      resource: `/api/users/${user_id}/forms/${form.id}`,
      method: 'delete'
    })

    this.updateForms()
  }

  render () {
    const { forms, loading } = this.state
    let content

    if (loading.forms === true) {
      content = 'Loading...'
    } else {
      content = [
        forms.map((form, index) => 
          <div
            key={ index }
            className={`form oh${
              (form.id === loading.deletingId)? ' gettingDeleted': ''
            }`}
          >
            <div className='title fl'>{form.title}</div>
            <div className='actions fr'>
              <Link to={ `/editor/${form.id}` }>Edit</Link>
              <a href='#/' onClick={ this.handleFormDeleteClick.bind(this, form) } >
                Delete
              </a>
            </div>
          </div>
        ),
        <div className='form oh'>
          <Link to='/editor'>Create New Form</Link>
        </div>
      ]
    }

    return <div className='forms center oh'>
      {content}
    </div>
  }
}
