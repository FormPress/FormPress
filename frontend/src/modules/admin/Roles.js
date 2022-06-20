import { faAdversal } from '@fortawesome/free-brands-svg-icons'
import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api } from '../../helper'
import * as Elements from '../elements'
import Renderer from '../Renderer'

import './Roles.css'

const elementMeta = {}
Object.values(Elements).forEach((elem) => {
  elementMeta[elem.defaultConfig.type] = elem.metaData.displayText
})

class Roles extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saved: true,
      loaded: false,
      selectedRoleId: 0,
      selectedRoleName: '',
      permissions: {
        formLimit: '0',
        submissionLimit: '0',
        uploadLimit: '0'
      },
      message: ''
    }
    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.handleSelectRole = this.handleSelectRole.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.updateRoles = this.updateRoles.bind(this)
  }

  async updateRoles() {
    this.setState({ loaded: false })
    const { data } = await api({
      resource: `/api/admin/roles`
    })
    data.forEach((role) => {
      role.permission = JSON.parse(role.permission)
    })
    //add elements to permissions
    const newPermissions = { ...this.state.permissions }
    for (const key in Elements) {
      newPermissions[key] = false
    }

    this.setState({ loaded: true, data, permissions: newPermissions })
  }

  async componentDidMount() {
    await this.updateRoles()
  }

  handleSelectRole(roleId, incMessage = '') {
    const { data } = this.state
    const newPermissions = { ...this.state.permissions }
    let rolePermissions = {}
    let roleName = ''
    const role_id = parseInt(roleId)
    if (role_id !== 0) {
      rolePermissions = data.filter((role) => role.id === role_id)[0].permission
      roleName = data.filter((role) => role.id === role_id)[0].name
    }
    Object.keys(newPermissions).forEach((element) => {
      if (
        element === 'formLimit' ||
        element === 'submissionLimit' ||
        element === 'uploadLimit'
      ) {
        newPermissions[element] = rolePermissions[element] || '1'
      } else {
        newPermissions[element] = rolePermissions[element] || false
      }
    })
    this.setState({
      selectedRoleName: roleName,
      selectedRoleId: role_id,
      permissions: newPermissions,
      message: incMessage,
      saved: true
    })
  }

  handleFieldChange(elem, e) {
    this.setState({ saved: false })
    const newPermissions = { ...this.state.permissions }

    if (elem.type === 'Checkbox') {
      const newPermissions = { ...this.state.permissions }
      const elementText = elem.options[0]
      const elementType = Object.keys(elementMeta).find(
        (searchedElem) => elementMeta[searchedElem] === elementText
      )
      newPermissions[elementType] = !newPermissions[elementType]
      this.setState({ permissions: newPermissions })
    } else if (elem.type === 'TextBox') {
      if (this.state.selectedRoleId !== 2) {
        this.setState({ selectedRoleName: e.target.value })
      }
    } else if (elem.type === 'Number') {
      if (elem.label === 'Form Limit') {
        if (!isNaN(parseInt(e.target.value))) {
          newPermissions.formLimit = e.target.value
          this.setState({ permissions: newPermissions })
        }
      }

      if (elem.label === 'Submission Limit (Monthly)') {
        if (!isNaN(parseInt(e.target.value))) {
          newPermissions.submissionLimit = e.target.value
          this.setState({ permissions: newPermissions })
        }
      }

      if (elem.label === 'Upload Limit (in MB)') {
        if (!isNaN(parseInt(e.target.value))) {
          newPermissions.uploadLimit = e.target.value
          this.setState({ permissions: newPermissions })
        }
      }
    }
  }

  async handleSave(e) {
    e.preventDefault()
    const { selectedRoleId, selectedRoleName, permissions } = this.state
    if (selectedRoleName !== '') {
      const roleId = selectedRoleId
      const name = selectedRoleName
      const { data } = await api({
        resource: `/api/admin/roles/${roleId}`,
        method: 'put',
        body: { name, permissions }
      })
      this.setState({ saved: true, message: data.message })
      await this.updateRoles()
      this.handleSelectRole(data.roleId, data.message)
    } else {
      this.setState({ message: 'Please set a role name' })
    }
  }

  renderRolePermissions() {
    const { permissions } = this.state
    const permissionKeys = Object.keys(permissions).map((key) => key)
    const formElements = permissionKeys.map((key, id) => {
      if (key === 'formLimit') {
        return {
          id: id,
          type: 'Number',
          label: 'Form Limit',
          value: this.state.permissions.formLimit,
          sublabelText: '(0 for unlimited)',
          min: 0,
          max: 99999999
        }
      } else if (key === 'submissionLimit') {
        return {
          id: id,
          type: 'Number',
          label: 'Submission Limit (Monthly)',
          value: this.state.permissions.submissionLimit,
          sublabelText: '(0 for unlimited)',
          min: 0,
          max: 99999999
        }
      } else if (key === 'uploadLimit') {
        return {
          id: id,
          type: 'Number',
          label: 'Upload Limit (in MB)',
          value: this.state.permissions.uploadLimit,
          sublabelText: '(0 for unlimited)',
          min: 0,
          max: 99999999
        }
      } else {
        const elemText = elementMeta[key]
        return {
          id: id,
          type: 'Checkbox',
          label: '',
          options: [elemText],
          value: this.state.permissions[key]
        }
      }
    })

    formElements.unshift({
      id: formElements.length,
      type: 'TextBox',
      label: 'Role Name',
      value: this.state.selectedRoleName
    })

    formElements.push({
      id: formElements.length + 1,
      type: 'Button',
      buttonText: this.state.selectedRoleId === 0 ? 'CREATE' : 'SAVE'
    })

    return (
      <div>
        <form onSubmit={this.handleSave}>
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
        <div className="col-4-16 rolelist">
          {loaded &&
            data.map((role) => (
              <div
                className={
                  this.state.selectedRoleId === role.id
                    ? 'selectedrole'
                    : 'role'
                }
                key={role.id}
                value={role.id}
                onClick={() => this.handleSelectRole(role.id)}>
                {role.name}
              </div>
            ))}
          <div
            className={
              this.state.selectedRoleId === 0 ? 'selectedrole' : 'role'
            }
            key={0}
            value={0}
            onClick={() => this.handleSelectRole(0, '')}>
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

const RolesWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Roles {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default RolesWrapped
