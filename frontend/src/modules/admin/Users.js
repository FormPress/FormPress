import React, { Component } from 'react'
import { api, setToken } from '../../helper'
import Renderer from '../Renderer'
import moment from 'moment'

import './Users.css'
const BACKEND = process.env.REACT_APP_BACKEND

export default class Users extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saved: true,
      loaded: false,
      userListIsloaded: false,
      selectedUserId: 0,
      roleName: '',
      signupDate: '',
      emailVerified: 0,
      message: '',
      roles: [],
      forms: []
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
    this.setState({ loaded: true, roles: data })
  }

  getUserFormList = async (user_id) => {
    let result = []
    const { data } = await api({
      resource: `/api/admin/users/${user_id}/forms`
    })

    data.forEach((form) => {
      result.push({
        link: `${BACKEND}/form/view/${form.id}`,
        created_at: form.created_at
      })
    })

    this.setState({ forms: result })
  }

  componentDidMount() {
    this.getUserList()
    this.getRoleList()
  }

  handleFieldChange = (elem, e) => {
    this.setState({ saved: false })
    if (elem.label === 'Role Name') {
      this.setState({ roleName: e.target.value })
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
      this.getUserFormList(user_id)

      this.setState({
        selectedUserId: user_id,
        roleName: user.role_name,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        signupDate: user.created_at,
        message: incMessage,
        saved: true
      })
    }
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
    e.preventDefault()
    this.setState({ saved: false })
    const { selectedUserId, roles, roleName, isActive } = this.state
    let roleId = null

    roles.filter(async (role) => {
      if (role.name === roleName) {
        roleId = role.id
      }
    })

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
        this.props.generalContext.auth.setAuth({
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

  addToWhitelist = async () => {
    const { selectedUserId } = this.state

    if (selectedUserId !== 0) {
      const { success } = await api({
        resource: `/api/admin/whitelist/${selectedUserId}`,
        method: 'post'
      })

      if (success === true) {
        this.setState({ saved: true, message: 'User added in whitelist' })
      } else {
        this.setState({
          saved: true,
          message: 'User cannot added in whitelist'
        })
      }
    } else {
      this.setState({ message: 'Please select a user' })
    }
  }

  render() {
    const { data, userListIsloaded, forms } = this.state
    return (
      <div className="userwrap">
        <div className="wrap-left">
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
          <div className="col-2-16 userpands">
            <div className="userdetail">
              <div
                className="loginAsUser"
                onClick={() => this.handleLoginAsUser()}>
                Login As User
              </div>
            </div>
            <div className="userdetail">
              <div
                className="addToWhitelist"
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to whitelist this user?'
                    )
                  ) {
                    this.addToWhitelist()
                  }
                }}>
                Add to Whitelist
              </div>
            </div>
            <div className="userdetail">
              <div className="message">
                User Status:{' '}
                {this.state.isActive === 1 ? 'Active' : 'Suspended'}
              </div>
              <div className="statusUser" onClick={(e) => this.changeStatus(e)}>
                Change Status
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
                          label: 'Role Name',
                          options: this.state.roles.map((role) => role.name),
                          placeholder: this.state.roleName
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
            <div className="message">Status: {this.state.message}</div>
            <div className="message">
              Signup Date:{' '}
              {moment(this.state.signupDate).format('DD.MM.YYYY, hh:mm:ss')}
            </div>
          </div>
        </div>
        <div className="wrap-right">
          <div className="col-2-16 userforms">
            <div className="message">
              Forms:
              {forms.map((form) => (
                <div key={form.link}>
                  <a href={form.link} target="_blank" rel="noopener noreferrer">
                    {form.link}
                  </a>
                  <div>
                    Created Date:{' '}
                    {moment(form.created_at).format('DD.MM.YYYY, hh:mm:ss')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}
