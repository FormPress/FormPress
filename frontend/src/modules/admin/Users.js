import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api } from '../../helper'
import Renderer from '../Renderer'

import './Users.css'

class Users extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saved: true,
      loaded: false,
      selectedUserId: 0,
      roleId: 0,
      emailVerified: 0,
      isActive: '',
      message: ''
    }

    this.handleSave = this.handleSave.bind(this)
    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.listUser = this.listUser.bind(this)
  }

  async listUser() {
    this.setState({ loaded: false })
    const { data } = await api({
      resource: `/api/admin/users`
    })

    this.setState({ loaded: true, data })
  }

  async componentDidMount() {
    await this.listUser()
  }

  handleFieldChange(elem, e) {
    this.setState({ saved: false })
    if (elem.label === 'Role Id' && !isNaN(parseInt(e.target.value))) {
      this.setState({ roleId: e.target.value })
    }
    if (elem.label === 'Is Active' && !isNaN(parseInt(e.target.value))) {
      this.setState({ isActive: e.target.value })
    }
  }

  handleSelectUser(userId, incMessage = '') {
    const { data } = this.state
    const user_id = parseInt(userId)
    if (user_id !== 0) {
      const user = data.filter((user) => user.id === user_id)[0]

      this.setState({
        selectedUserId: user_id,
        roleId: user.role_id,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        message: incMessage,
        saved: true
      })
    }
  }

  async handleSave(e) {
    e.preventDefault()
    const { selectedUserId, roleId, isActive } = this.state

    if (selectedUserId !== 0) {
      const { data } = await api({
        resource: `/api/admin/users/${selectedUserId}`,
        method: 'put',
        body: { roleId, isActive }
      })
      this.setState({ saved: true, message: data.message })
      await this.listUser()
      this.handleSelectUser(data.id, data.message)
    } else {
      this.setState({ message: 'Please select a user' })
    }
  }

  render() {
    const { data, loaded } = this.state
    return (
      <div className="userwrap">
        <div>
          <div className="col-4-16 userlist">
            {loaded &&
              data.map((user) => (
                <div
                  className={
                    this.state.selectedUserId === user.id
                      ? 'selecteduser'
                      : 'user'
                  }
                  key={user.id}
                  value={user.id}
                  onClick={() => this.handleSelectUser(user.id)}>
                  {user.email}
                </div>
              ))}
          </div>
          <div className="userpands">
            <div className="userdetail">
              <form onSubmit={this.handleSave}>
                <Renderer
                  className="form"
                  theme="infernal"
                  allowInternal={true}
                  handleFieldChange={this.handleFieldChange}
                  form={{
                    props: {
                      elements: [
                        {
                          id: 1,
                          type: 'Number',
                          label: 'Role Id',
                          value: this.state.roleId,
                          min: 1,
                          max: 200
                        },
                        {
                          id: 2,
                          type: 'Number',
                          label: 'Is Active',
                          value: this.state.isActive,
                          min: 0,
                          max: 1
                        },
                        {
                          id: 3,
                          type: 'Button',
                          buttonText: 'SAVE'
                        }
                      ]
                    }
                  }}
                />
              </form>
            </div>
            <div className="savedornot">
              {this.state.saved ? 'Saved' : 'Changes do not saved'}
            </div>
            <div className="servermessage">Status: {this.state.message}</div>
          </div>
        </div>
      </div>
    )
  }
}

const UsersWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Users {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default UsersWrapped
