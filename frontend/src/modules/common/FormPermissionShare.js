import React, { Component } from 'react'
import { api } from '../../helper'
import Renderer from '../Renderer'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash, faPen, faCheck } from '@fortawesome/free-solid-svg-icons'

import './FormPermissionShare.css'

const getBaseElements = () => [
  {
    id: 'target_user_email',
    type: 'Email',
    label: 'Email',
    value: '',
    disabled: false
  },
  {
    id: 'read',
    type: 'Checkbox',
    label: '',
    options: ['View form in Builder'],
    value: false
  },
  {
    id: 'edit',
    type: 'Checkbox',
    label: '',
    options: ['Edit form in Builder'],
    value: false
  },
  {
    id: 'data',
    type: 'Checkbox',
    label: '',
    options: ['View submissions in Data'],
    value: false
  },
  {
    id: 'submit',
    type: 'Button',
    buttonText: 'Save',
    disabled: false
  }
]

export default class FormPermissionShare extends Component {
  setLoadingState(key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async updatePermissions() {
    this.setLoadingState('permissions', true)
    ///api/users/:user_id/forms/:form_id/permissions
    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${this.props.form.id}/permissions/list`
    })
    const permissions = data

    this.setState({ permissions })
    this.setLoadingState('permissions', false)
  }

  componentDidMount() {
    this.updatePermissions()
  }

  getRawFormValues() {
    return this.state.permissionForm.props.elements.reduce((acc, elem) => {
      acc[elem.id] = elem

      return acc
    }, {})
  }

  checkTargetEmail(newEmail) {
    const existingPerms = this.state.permissions
    const ifExists = existingPerms.find(
      ({ target_user_email }) => target_user_email === newEmail
    )

    return ifExists
  }

  getDynamicPermissionForm(overrides = { id: '', elements: {} }) {
    const form = this.state.permissionForm
    const elems = this.getRawFormValues()

    elems.target_user_email.disabled = this.state.mode === 'EditPermission'
    elems.submit.buttonText =
      this.state.mode === 'EditPermission' ? 'Save' : 'Share Form'
    elems.submit.disabled = this.state.loading.permissionForm

    for (const key of Object.keys(overrides.elements)) {
      elems[key].value = overrides.elements[key]
    }

    if (overrides.id) {
      form.id = overrides.id
    }

    return {
      id: form.id,
      props: {
        elements: Object.keys(elems).map((key) => elems[key])
      }
    }
  }

  constructor(props) {
    super(props)
    this.state = {
      mode: 'Index', // Can be, Index, EditPermission, CreatePermission, ConfirmDeletePermission
      permissionForm: {
        id: '', //Id of the permission being edited
        props: {
          elements: getBaseElements()
        }
      },
      permissions: [],
      loading: {
        permissions: false,
        permissionForm: false,
        deletePermission: false
      }
    }
  }

  handleFieldChange(elem, e) {
    this.setState({
      permissionForm: this.getDynamicPermissionForm({
        elements: {
          [elem.id]:
            e.target.type === 'checkbox' ? e.target.checked : e.target.value
        }
      })
    })
  }

  handleEditPermissionClick(permission, e) {
    e.preventDefault()
    this.setState({
      mode: 'EditPermission',
      permissionForm: this.getDynamicPermissionForm({
        id: permission.id,
        elements: {
          target_user_email: permission.target_user_email,
          ...permission.permissions
        }
      })
    })
  }

  handleDeletePermissionClick(permission, e) {
    e.preventDefault()
    this.setState({
      mode: 'DeletePermissionConfirm',
      permissionForm: this.getDynamicPermissionForm({
        id: permission.id,
        elements: {
          target_user_email: permission.target_user_email
        }
      })
    })
  }

  handleAddNewPermissionClick(e) {
    e.preventDefault()
    this.setState({
      mode: 'NewPermission',
      permissionForm: {
        id: '',
        props: {
          elements: getBaseElements()
        }
      }
    })
  }

  handleGoBackClick(e) {
    e.preventDefault()
    this.setState({ mode: 'Index' })
  }

  async handleFormSave(e) {
    e.preventDefault()
    this.setLoadingState('permissionForm', true)
    const { target_user_email, data, edit, read } = this.getRawFormValues()
    target_user_email.value = target_user_email.value.toLowerCase()
    const checkIfExist = this.checkTargetEmail(target_user_email.value)

    if (this.state.mode === 'EditPermission' || checkIfExist !== undefined) {
      let updatePermissionId = ''
      if (this.state.mode === 'EditPermission') {
        updatePermissionId = this.state.permissionForm.id
      } else {
        updatePermissionId = checkIfExist.id
      }
      await api({
        resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${this.props.form.id}/permissions/${updatePermissionId}`,
        body: {
          permission: {
            permissions: {
              data: data.value,
              edit: edit.value,
              read: read.value
            }
          }
        },
        method: 'PUT'
      })
    } else {
      await api({
        resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${this.props.form.id}/permissions/new`,
        body: {
          permission: {
            permissions: {
              data: data.value,
              edit: edit.value,
              read: read.value
            },
            target_user_email: target_user_email.value
          }
        },
        method: 'POST'
      })
    }

    this.setLoadingState('permissionForm', false)
    this.setState({
      mode: 'Index'
    })
    this.updatePermissions()
  }

  async performDeletePermission(e) {
    e.preventDefault()
    this.setLoadingState('deletePermission', true)

    await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${this.props.form.id}/permissions/${this.state.permissionForm.id}`,
      method: 'DELETE'
    })

    this.setLoadingState('deletePermission', false)
    this.updatePermissions()
    this.setState({
      mode: 'Index'
    })
  }

  render() {
    const content = this[`render${this.state.mode}`]()
    let goBack = ''
    if (this.state.mode !== 'Index') {
      goBack = (
        <div className="elementButton">
          <button onClick={this.handleGoBackClick.bind(this)}>
            &#60; Go Back
          </button>
        </div>
      )
    }

    return (
      <div className="infernal">
        {goBack}
        {content}
      </div>
    )
  }
  renderIndex() {
    return (
      <div className="formPermissionShare">
        Share your forms with other FormPress users, with various permissions.{' '}
        <br />
        {this.state.loading.permissions
          ? 'Loading...'
          : this.renderPermissionsList()}
        <div className="elementButton">
          <button onClick={this.handleAddNewPermissionClick.bind(this)}>
            Add New Permission
          </button>
        </div>
      </div>
    )
  }

  renderPermissionsList() {
    return (
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Status</th>
            <th className="perm">Read</th>
            <th className="perm">Edit</th>
            <th className="perm">Data</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {this.state.permissions.map((permission) => (
            <tr key={permission.target_user_email} className="permissionRow">
              <td>{permission.target_user_email}</td>
              <td className="invite-status">
                {permission.target_user_id ? 'Accepted' : 'Pending'}
              </td>
              <td
                className={
                  permission.permissions.read ? 'active perm' : 'perm'
                }>
                <FontAwesomeIcon icon={faCheck} />
              </td>
              <td
                className={
                  permission.permissions.edit ? 'active perm' : 'perm'
                }>
                <FontAwesomeIcon icon={faCheck} />
              </td>
              <td
                className={
                  permission.permissions.data ? 'active perm' : 'perm'
                }>
                <FontAwesomeIcon icon={faCheck} />
              </td>
              <td className="actions">
                <span
                  title="Edit"
                  onClick={this.handleEditPermissionClick.bind(
                    this,
                    permission
                  )}>
                  <FontAwesomeIcon icon={faPen} />
                </span>
                <span
                  title="Delete"
                  onClick={this.handleDeletePermissionClick.bind(
                    this,
                    permission
                  )}>
                  <FontAwesomeIcon icon={faTrash} />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  renderDeletePermissionConfirm() {
    const elems = this.getRawFormValues()
    return (
      <div>
        <div className="confirmDeletePerm">
          Confirm the revocation of permissions from user{' '}
          <i>{elems.target_user_email.value}</i>. <br />
        </div>
        <div className="elementButton">
          <button
            disabled={this.state.loading.deletePermission}
            onClick={this.performDeletePermission.bind(this)}>
            Confirm
          </button>
        </div>
      </div>
    )
  }

  renderEditPermission() {
    return <div>{this.renderPermissionForm()}</div>
  }

  renderNewPermission() {
    return <div>{this.renderPermissionForm()}</div>
  }

  renderPermissionForm() {
    return (
      <form onSubmit={this.handleFormSave.bind(this)}>
        <Renderer
          className="form"
          theme="infernal"
          allowInternal={true}
          handleFieldChange={this.handleFieldChange.bind(this)}
          form={this.getDynamicPermissionForm()}
        />
      </form>
    )
  }
}
