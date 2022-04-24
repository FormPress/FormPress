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
      message: '',
      role: '',
    }
    this.handleSelectUser = this.handleSelectUser.bind(this)
    this.updateUsers = this.updateUsers.bind(this)
  }

  async updateUsers() {
    this.setState({ loaded: false })
    const { data } = await api({
      resource: `/api/admin/users`
    })

    this.setState({ loaded: true, data })
  }

  async componentDidMount() {
    await this.updateUsers()
  }

  handleSelectUser(userId, incMessage = '') {
    const { data } = this.state
    const user_id = parseInt(userId)
    let role = '';
    if (user_id !== 0) {
      role = data.filter((user) => user.id === user_id)[0].role
    }
    this.setState({
      selectedUserId: user_id,
      role: role,
      message: incMessage,
      saved: true
    })
  }

  render() {
    const { data, loaded } = this.state
    return (
      <div className="rolewrap">
        <div className="col-4-16 rolelist">
          {loaded &&
            data.map((user) => (
              <div
                className={
                  this.state.selectedUserId === user.id
                    ? 'selectedrole'
                    : 'role'
                }
                key={user.id}
                value={user.id}
                onClick={() => this.handleSelectUser(user.id)}>
                {user.email}
              </div>
            ))}
          <div
            className={
              this.state.selectedUserId === 0 ? 'selecteduser' : 'user'
            }
            key={0}
            value={0}
            onClick={() => this.handleSelectUser(0, '')}>
            Create New
          </div>
        </div>
        <div className="rolepands">
          <div className="rolepermission">{this.renderRolePermissions()}</div>
          <div className="savedornot">
            {this.state.saved ? 'Saved' : 'Changes do not saved'}
          </div>
          <div className="servermessage">Status: {this.state.message}</div>
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
