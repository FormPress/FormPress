import React, { Component } from 'react'
import { api } from '../../helper'
import moment from 'moment'
import GeneralContext from '../../general.context'

import './Users.css'

class Users extends Component {
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
      forms: [],
      userLocation: ''
    }

    this.handleRole = this.handleRole.bind(this)
    this.handleSave = this.handleSave.bind(this)
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
      resource: `/api/admin/users/${user_id}`
    })

    const user = data[0]

    this.setState({
      selectedUserId: user_id,
      roleName: user.role_name,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
      signupDate: user.created_at,
      saved: true
    })

    user.forms.forEach((form) => {
      result.push({
        link: `${process.env.FE_BACKEND || global.env.FE_BACKEND}/form/view/${
          form.uuid
        }`,
        created_at: form.created_at
      })
    })
    let userLastLocation = 'N/A'
    if (user.lastLocation.length > 0) {
      userLastLocation = user.lastLocation[0].value
    }
    this.setState({ forms: result, userLocation: userLastLocation })
  }

  componentDidMount() {
    this.getUserList()
    this.getRoleList()
  }

  handleRole(e) {
    this.setState({
      roleName: e.target.value,
      saved: false
    })
  }

  handleSelectUser = async (userId, incMessage = '') => {
    this.setState({ message: 'Loading..' })
    const { data } = this.state
    const user_id = parseInt(userId)
    if (user_id !== 0) {
      const user = data.filter((user) => user.id === user_id)[0]
      await this.getUserFormList(user_id)

      user.country = this.state.userLocation

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
        this.props.generalContext.auth.setAuth({
          email: data.email,
          name: data.name,
          impersonate: data.impersonate,
          user_id: data.user_id,
          user_role: data.user_role,
          role_name: data.role_name,
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

  renderUser() {
    const {
      forms,
      isActive,
      saved,
      roleName,
      roles,
      message,
      selectedUserId,
      signupDate
    } = this.state

    if (selectedUserId === 0) {
      return 'Select User'
    } else {
      return (
        <div className="user-info">
          <div className="userpands">
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
              <div className={isActive === 1 ? 'greentext' : 'browntext'}>
                User Status: {isActive === 1 ? 'Active' : 'Suspended'}
              </div>
              <div className="statusUser" onClick={(e) => this.changeStatus(e)}>
                Change Status
              </div>
            </div>
            <div className="userdetail">
              <label htmlFor="roleselect">Role</label>
              <select
                value={roleName}
                onChange={this.handleRole}
                id="roleselect">
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <button className="saveuser-button" onClick={this.handleSave}>
                SAVE
              </button>
            </div>
            <div className={saved ? 'savedtext' : 'notsavedtext'}>
              {saved ? 'Saved' : 'Changes do not saved'}
            </div>
            <div className="message">Status: {message}</div>
            <div className="message">
              Signup Date: {moment(signupDate).format('DD.MM.YYYY, hh:mm:ss')}
            </div>
          </div>
          <div className="wrap-right">
            <div className="col-2-16 userforms">
              <div className="message">
                Forms:
                {forms.map((form) => (
                  <div className="form-element" key={form.link}>
                    <a
                      href={form.link}
                      target="_blank"
                      rel="noopener noreferrer">
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

  render() {
    const { data, userListIsloaded } = this.state
    return (
      <div className="userwrap">
        <div className="wrap-left">
          <div className="col-4-16 userlist">
            {userListIsloaded &&
              data.map((user) => (
                <div
                  className={user.isActive ? 'greentext' : 'browntext'}
                  key={user.id}>
                  <div
                    className={
                      this.state.selectedUserId === user.id
                        ? 'selecteduser'
                        : 'user'
                    }
                    key={user.id}
                    value={user.id}
                    onClick={() => this.handleSelectUser(user.id)}>
                    <p className="margin_0">
                      Id: {user.id}{' '}
                      <span className="country-span">
                        Country: {user.country ? user.country : ''}
                      </span>
                    </p>
                    <p className="margin_0">{user.email}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div>{this.renderUser()}</div>
      </div>
    )
  }
}

const UserWrapped = (props) => (
  <GeneralContext.Consumer>
    {(value) => <Users {...props} generalContext={value} />}
  </GeneralContext.Consumer>
)

export default UserWrapped
