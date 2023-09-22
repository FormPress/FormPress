import React, { Component } from 'react'

import { api } from '../../helper'

import './FormShareInvitation.css'
export default class FormShareInvitation extends Component {
  static componentName = 'FormShareInvitation'
  static path = '/settings/formShareInvitation/:form_id/:id'
  static menuText = '__HIDDEN__'

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      accepting: false,
      permission: {},
      accepted: false,
      error: ''
    }
  }

  async componentDidMount() {
    ///api/users/:user_id/forms/:form_id/permissions
    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${this.props.match.params.form_id}/permissions/${this.props.match.params.id}`
    })
    console.log('Got permission from api ', data)

    this.setState({ permission: data, loading: false })
  }

  async accept() {
    this.setState({ accepting: true })
    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${this.props.match.params.form_id}/permissions/${this.props.match.params.id}/accept`,
      method: 'POST'
    })
    if (data.status === 'done') {
      this.setState({ accepting: true, accepted: true })
    } else {
      this.setState({ error: data.message })
    }
  }

  renderShareContent() {
    if (this.state.loading === true) {
      return <div>Loading...</div>
    }

    if (this.state.accepted === true) {
      return (
        <div>
          Success! <a href="/forms">Click to navigate forms</a>
        </div>
      )
    }

    if (this.state.error !== '') {
      return <div>Form do not found. Make sure you have the correct link.</div>
    }

    return <div>You have been invited to a form</div>
  }

  render() {
    return (
      <div className="infernal invite-main">
        {this.renderShareContent()}
        {this.state.accepted ? (
          ''
        ) : (
          <div className="elementButton">
            <button
              disabled={this.state.accepting}
              onClick={this.accept.bind(this)}>
              Accept
            </button>
          </div>
        )}
      </div>
    )
  }
}
