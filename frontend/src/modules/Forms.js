import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faTrash,
  faPen,
  faPlusCircle,
  faClone
} from '@fortawesome/free-solid-svg-icons'
import Moment from 'react-moment'

import { api } from '../helper'
import Table from './common/Table'
import Modal from './common/Modal'
import AuthContext from '../auth.context'

import './Forms.css'

const BACKEND = process.env.REACT_APP_BACKEND
class Forms extends Component {
  setLoadingState(key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async updateForms() {
    this.setLoadingState('forms', true)

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`
    })
    const forms = data

    this.setLoadingState('forms', false)
    this.setState({ forms })
  }

  componentDidMount() {
    this.updateForms()
  }

  constructor(props) {
    super(props)
    this.state = {
      isModalOpen: false,
      cloneFormName: '',
      modalContent: {},
      forms: [],
      loading: {
        forms: false,
        deletingId: false
      }
    }
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.handleCloneFormTitleChange = this.handleCloneFormTitleChange.bind(this)
    this.handleCountSubmissions = this.handleCountSubmissions.bind(this)
  }

  handleFormCloneClick(form, e) {
    e.preventDefault()

    const modalContent = {
      header: 'Clone form',
      status: 'information'
    }

    let cloneFormName = 'Clone of ' + form.title

    if (cloneFormName.length > 256) {
      let excessChars = cloneFormName.length - 256
      cloneFormName = cloneFormName.slice(0, -excessChars)
    }

    this.setState({ cloneFormName })
    modalContent.dialogue = {
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick,
      positiveText: 'Clone',
      positiveClick: this.formClone.bind(this, form),
      inputValue: () => {
        return this.state.cloneFormName
      },
      inputOnChange: (e) => this.handleCloneFormTitleChange(e)
    }

    modalContent.content = (
      <div>
        <strong
          style={{
            color: '#719fbd',
            fontWeight: 'bold',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all'
          }}>
          {form.title}
          </strong>{' '}
        will be cloned. Please specify a name for the new form.

      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  handleFormDeleteClick(form, e) {
    e.preventDefault()
    const modalContent = {
      header: 'Delete form?',
      status: 'warning'
    }

    modalContent.dialogue = {
      negativeText: 'Delete',
      negativeClick: this.formDelete.bind(this, form),
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick
    }

    modalContent.content = (
      <div>
        <strong
          style={{
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            wordBreak: 'break-all'
          }}>
          {form.title}
        </strong>{' '}
        will be deleted <strong>permanently.</strong> Are you sure you want to proceed?
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  handleCloneFormTitleChange(e) {
    let name = e.target.value
    let limit = 256
    if (name.length >= limit) {
      name = name.substr(0, limit)
      name
        .replace(/<span(.*?)>(.*?)<\/span>/, '')
        .replace(/(<([^>]+)>)/gi, '')
        .trim()
    }
    this.setState({ cloneFormName: name })
  }

  async formDelete(form) {
    this.setState({
      loading: {
        ...this.state.loading,
        deletingId: form.id
      }
    })

    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms/${form.id}`,
      method: 'delete'
    })

    window.localStorage.removeItem('lastEditedFormId')

    let modalContent = {}

    if (data.message === 'deleted') {
      modalContent = {
        content: 'Form successfully deleted!',
        status: 'success',
        header: 'Success!'
      }
    } else {
      modalContent = {
        content:
          'There was an error deleting this form. Please contact support.',
        status: 'error',
        header: 'Error'
      }
    }
    this.setState({ modalContent })
    setTimeout(() => {
      this.handleCloseModalClick()
    }, 1500)

    await this.updateForms()
  }

  async formClone(form) {
    form.id = null
    form.title = this.state.cloneFormName
    const { data } = await api({
      resource: `/api/users/${this.props.auth.user_id}/forms`,
      method: 'post',
      body: form
    })

    let modalContent = {}

    if (data.status === 'done') {
      modalContent = {
        content: 'Form cloned successfully!',
        status: 'success',
        header: 'Success!'
      }
    } else {
      modalContent = {
        content:
          'There was an error cloning this form. Please contact support.',
        status: 'error',
        header: 'Error'
      }
    }
    this.setState({ modalContent })

    setTimeout(() => {
      this.handleCloseModalClick()
    }, 1500)

    this.updateForms()
  }

  handlePreviewClick(form) {
    const { id } = form

    window.open(`${BACKEND}/form/view/${id}`, '_blank')
  }

  handleCloseModalClick() {
    this.setState({ isModalOpen: false, modalContent: {} })
  }

  handleCountSubmissions(value) {
    let newValue = value
    if (value >= 1000) {
      const suffixes = ['', 'k', 'm', 'b', 't']
      const suffixNum = Math.floor((('' + value).length - 1) / 3)
      let shortValue = ''
      let precision = 3
      shortValue = parseFloat(
        (suffixNum !== 0
          ? value / Math.pow(1000, suffixNum)
          : value
        ).toPrecision(precision)
      )
      if (shortValue / 10 < 1) {
        shortValue = shortValue.toFixed(2)
      } else if (shortValue / 100 < 1) {
        shortValue = shortValue.toFixed(1)
      }
      newValue = shortValue + suffixes[suffixNum]
    }
    return newValue
  }

  render() {
    const { forms } = this.state
    let roleLimit = 2
    if (this.props.auth.permission.admin) {
      roleLimit = 0
    } else {
      roleLimit = parseInt(this.props.auth.permission.formLimit)
    }

    return (
      <div>
        <div className="forms">
          {this.state.isModalOpen ? (
              <Modal
                isOpen={this.state.isModalOpen}
                modalContent={this.state.modalContent}
                closeModal={this.handleCloseModalClick}
              />
            ) : null}
          {roleLimit === 0 || roleLimit > forms.length ? (
            <div className="nav_add_new_form_container">
              <Link to="/editor/new" className="nav_add_new_form_link">
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faPlusCircle}
                    title="Add New Form"
                    className="nav_add_new_form_logo"
                  />
                  <div className="popoverText">Create a new form</div>
                </div>
              </Link>
            </div>
          ) : (
            ''
          )}
          <div className="headerContainer"></div>
          <div className="formsContent">
            <Table
              columns={[
                {
                  label: <span> </span>,
                  content: () => <span> </span>,
                  className: 'mw'
                },
                {
                  label: 'Name',
                  content: (form) => (
                    <Link to={`/editor/${form.id}/builder`} title="Go To Form">
                      {form.title}
                    </Link>
                  ),
                  className: 'name',
                  title: ' '
                },
                {
                  label: 'Submissions',
                  content: (form) => (
                    <div className="responsesContainer">
                      <Link
                        to={{
                          pathname: '/data',
                          state: {
                            form_id: form.id,
                            submissionFilterSelectors: { showUnread: false }
                          }
                        }}
                        className={`responseCount${
                          form.responseCount === 0 ? ' zero' : ''
                        }`}
                        title="View the submissions to this form.">
                        {this.handleCountSubmissions(form.responseCount)}
                      </Link>
                      {form.unreadCount > 0 ? (
                        <span
                          className="unreadBadge"
                          title="Unread submissions">
                          {form.unreadCount > 99 ? '99' : form.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  ),
                  className: 'responses'
                },
                {
                  label: 'Created',
                  content: (form) => [
                    <Moment fromNow ago date={form.created_at} key="1" />,
                    <span key="2">{' ago'}</span>
                  ],
                  className: 'createdAt'
                },
                {
                  label: 'Actions',
                  content: (form) => (
                    <div className="actions">
                      <span
                        className={`${form.published_version ? 'view' : 'inactive_view'
                          }`}
                        title={
                          form.published_version
                            ? 'View Form'
                            : 'Form must be published before it can be viewed'
                        }
                        onClick={
                          form.published_version
                            ? this.handlePreviewClick.bind(this, form)
                            : undefined
                        }>
                        <FontAwesomeIcon icon={faEye} />
                      </span>
                      <span
                        title="Delete Form"
                        onClick={this.handleFormDeleteClick.bind(this, form)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </span>
                      <Link to={`/editor/${form.id}/builder`} title="Edit Form">
                        <FontAwesomeIcon icon={faPen} />
                      </Link>
                      {roleLimit === 0 || roleLimit > forms.length ? (
                        <span
                          title="Clone Form"
                          onClick={this.handleFormCloneClick.bind(this, form)}>
                          <FontAwesomeIcon icon={faClone} />
                        </span>
                      ) : (
                        <span
                          className="inactive_clone"
                          title="Form limit reached">
                          <FontAwesomeIcon icon={faClone} />
                        </span>
                      )}
                    </div>
                  )
                }
              ]}
              data={forms}
            />
          </div>
          <div className="newButtonContainer">
            {roleLimit === 0 || roleLimit > forms.length ? (
              <Link to="/editor/new">Create a new form</Link>
            ) : (
              <span className="disabledNewForm" title="Form limit reached">
                Create a new form
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
}

const FormsWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Forms {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default FormsWrapped
