import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api } from '../../helper'
import Renderer from '../Renderer'

import './Users.css'

class User extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saved: true,
      loaded: false,
      selectedUserId: 0,
      roleId: 0,
      message: ''
    }

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleSelectUser = this.handleSelectUser.bind(this)
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

  handleSelectUser(userId, incMessage = '') {
    const { data } = this.state
    let role_id = 0;
    const user_id = parseInt(userId)
    if (user_id !== 0) {
      role_id = data.filter((user) => user.id === user_id)[0].role_id
    }
    this.setState({
      selectedUserId: user_id,
      roleId: role_id,
      message: incMessage,
      saved: true
    })
  }

  handleFieldChange() {}

  renderUserDetails() {
    const { data } = this.state
    const formElements = data.map((user, id) => {
      return {
        id: id,
        type: 'TextBox',
        label: '',
        value: user
      }
    })

    // formElements.unshift({
    //   id: formElements.length,
    //   type: 'TextBox',
    //   label: 'UserId',
    //   value: this.state.selectedUserId
    // })

    // formElements.push({
    //   id: formElements.length + 1,
    //   type: 'Button',
    //   buttonText: 'SAVE'
    // })

    return (
      <div>
        <form>
          <Renderer
            className="form"
            theme="infernal"
            allowInternal={true}
            handleFieldChange={this.handleFieldChange}
            form={{
              props: {
                elements: formElements
              }
            }}
          />
        </form>
      </div>
    )
  }

  render() {
    const { data, loaded } = this.state
    return (
      <div className="rolewrap">
        <div>
          <div className="col-4-16 userlist">
          {loaded &&
            data.map((user) => (
              <div className={
                this.state.selectedUserId === user.id
                  ? 'selecteduser'
                  : 'user'
              } key={user.id} value={user.id}
                onClick={() => this.handleSelectUser(user.id)}>
                  {user.email}
              </div>
            ))}
        </div>
        <div className="rolepands">
          {/* <div className="">{this.renderUserDetails()}</div> */}
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
    {(value) => <User {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default UsersWrapped
