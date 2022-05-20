import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api, setToken } from '../../helper'
import Renderer from '../Renderer'

import './Users.css'

class Users extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saved: true,
      loaded: false,
      userListIsloaded: false,
      selectedUserId: 0,
      roleId: 0,
      emailVerified: 0,
      message: '',
      roles: []
    }
  }

  getUserList = async () => {
    this.setState({ userListIsloaded: false })
    const { data } = await api({
      resource: `/api/admin/users`
    })

    this.setState({ userListIsloaded: true, data })
  }

  getRoleList = async () => {
    this.setState({ loaded: false })
    const { data } = await api({
      resource: `/api/admin/roles`
    })
    let result = []

    data.forEach((role) => {
      result.push(role.id)
    })

    this.setState({ loaded: true, roles: result })
  }

  componentDidMount() {
    this.getUserList()
    this.getRoleList()
  }

  handleFieldChange = (elem, e) => {
    this.setState({ saved: false })
    if (elem.label === 'Role Id' && !isNaN(parseInt(e.target.value))) {
      this.setState({ roleId: parseInt(e.target.value) })
    }
    if (elem.label === 'Is Active' && !isNaN(parseInt(e.target.value))) {
      this.setState({ isActive: parseInt(e.target.value) })
    }
  }

  handleSelectUser = (userId, incMessage = '') => {
    const { data } = this.state
    const user_id = parseInt(userId)
    if (user_id !== 0) {
      const user = data.filter((user) => user.id === user_id)[0]

      this.setState({
        selectedUserId: user_id,
        roleId: parseInt(user.role_id),
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        message: incMessage,
        saved: true
      })
    }
  }

  onWatchUserStatusInDidUpdate = (prevProps, prevState) => {
    const isChanged = prevState.isActive !== this.state.isActive

    if (isChanged) {
      this.handleSave()
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this.onWatchUserStatusInDidUpdate(prevProps, prevState)
  }

  changeStatus = () => {
    this.setState({ saved: false })
    const { selectedUserId } = this.state
    if (selectedUserId !== 0) {
      this.setState((prevState) => ({
        isActive: Number(!prevState.isActive)
      }))
    } else {
      this.setState({ message: 'Please select a user' })
    }
  }

  handleSave = async (e) => {
    e?.preventDefault()
    this.setState({ saved: false })
    const { selectedUserId, roleId, isActive } = this.state

    if (selectedUserId !== 0) {
      const { data } = await api({
        resource: `/api/admin/users/${selectedUserId}`,
        method: 'put',
        body: { roleId, isActive }
      })

      const copyData = [...this.state.data]
      const selectedUser = copyData.find((user) => user.id === selectedUserId)

      selectedUser.role_id = parseInt(roleId)
      selectedUser.isActive = parseInt(isActive)

      const updatedData = copyData.map((user) =>
        selectedUserId === user.id ? (user = selectedUser) : user
      )

      this.setState({ saved: true, message: data.message, data: updatedData })
      this.handleSelectUser(selectedUserId, data.message)
    } else {
      this.setState({ message: 'Please select a user' })
    }
  }

  handleLoginAsUser = async () => {
    const { selectedUserId } = this.state

    if (selectedUserId !== 0) {
      const { success, data } = await api({
        resource: `/api/admin/users/${selectedUserId}/login-as-user/`,
        method: 'post'
      })

      if (success === true) {
        setToken(data.token)
        this.props.auth.setAuth({
          email: data.email,
          name: data.name,
          exp: data.exp,
          token: data.token,
          impersonate: data.impersonate,
          user_id: data.user_id,
          user_role: data.user_role,
          permission: data.permission,
          admin: data.admin,
          loggedIn: true
        })
      }
      this.setState({ state: 'done', message: data.message })
    } else {
      this.setState({ message: 'Please select a user' })
    }
  }

  render() {
    const { data, userListIsloaded } = this.state
    return (
      <div className="userwrap">
        <div>
          <div className="col-4-16 userlist">
            {userListIsloaded &&
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
              <div
                className="loginAsUser"
                onClick={() => this.handleLoginAsUser()}>
                Login As User
              </div>
            </div>
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
                          type: 'Dropdown',
                          label: 'Role Id',
                          options: this.state.roles,
                          placeholder: this.state.roleId
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
            <div className="userdetail">
              <div>
                User: {this.state.isActive === 1 ? 'Active' : 'Suspended'}
              </div>
              <div className="statusUser" onClick={(e) => this.changeStatus(e)}>
                Change Status
              </div>
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
