import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEye,
  faTrash,
  faPen,
  faClone,
  faUserLock,
  faLink
} from '@fortawesome/free-solid-svg-icons'
import Moment from 'react-moment'

import { api } from '../helper'
import Table from './common/Table'
import Modal from './common/Modal'
import FormPermissionShare from './common/FormPermissionShare'

import './Forms.css'
import { DotLoader } from 'react-spinner-overlay'

export default class Forms extends Component {
  setLoadingState(key, value) {
    this.setState({
      loading: {
        ...this.state.loading,
        [key]: value
      }
    })
  }

  async updateForms() {
    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms`
    })
    const forms = data

    this.setState({ forms })

    setTimeout(() => {
      this.setLoadingState('forms', false)
    }, 1000)
  }

  componentDidMount() {
    this.updateForms()
  }

  constructor(props) {
    super(props)
    this.state = {
      isModalOpen: false,
      isGettingStartedModalOpen: props.gettingStarted,
      cloneFormName: '',
      modalContent: {},
      forms: [],
      loading: {
        forms: true,
        deletingId: false
      }
    }
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.handleCloneFormTitleChange = this.handleCloneFormTitleChange.bind(this)
    this.handleCountSubmissions = this.handleCountSubmissions.bind(this)
    this.handleFormSharePermissionsClick = this.handleFormSharePermissionsClick.bind(
      this
    )
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
        will be deleted <strong>permanently.</strong> Are you sure you want to
        proceed?
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  handleFormSharePermissionsClick(form, e) {
    e.preventDefault()

    const modalContent = {
      header: 'Share Form with others',
      status: 'information'
    }

    modalContent.dialogue = {
      abortText: 'Done',
      abortClick: this.handleCloseModalClick
    }

    modalContent.content = (
      <FormPermissionShare
        form={form}
        generalContext={this.props.generalContext}
      />
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
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms/${form.id}`,
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

    const integrationTypesNeedToBeFiltered = ['GoogleDrive']

    form.props.integrations = form.props.integrations.filter(
      (integration) =>
        !integrationTypesNeedToBeFiltered.includes(integration.type)
    )

    const { data } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/forms`,
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
    const { uuid } = form

    window.open(`${global.env.FE_BACKEND}/form/view/${uuid}`, '_blank')
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

  renderGettingStartedModal() {
    const { isGettingStartedModalOpen } = this.state
    const { auth } = this.props.generalContext

    const handleCloseModalCLick = () => {
      this.props.history.replace({
        pathname: '/forms',
        state: {
          gettingStarted: false
        }
      })
    }

    let prePopulateQueryParams = ''

    if (auth && auth.email) {
      prePopulateQueryParams = `&q_email=${auth.email}`
    }

    let iframeSrc =
      `https://app.formpress.org/form/view/ae925fea-48b7-4907-b2c4-90abfc849e3b?embed=true` +
      prePopulateQueryParams

    return (
      <Modal
        isOpen={isGettingStartedModalOpen}
        modalContent={{}}
        closeModal={handleCloseModalCLick}>
        <div
          className={'modal-wrapper feedbackFormContainer'}
          onClick={(e) => {
            e.stopPropagation()
          }}>
          <div className={`wrapper-header`}>
            Welcome to FormPress!
            <span className="close-modal" onClick={handleCloseModalCLick}>
              x
            </span>
          </div>
          <p className="getting_started_greetings">
            We are excited to have you here! FormPress is an open-source form
            builder and we are working hard to make it the best on the market.
            We would love to hear your feedback and suggestions. Please let us
            know about your use case and why you chose FormPress.
          </p>
          <p className="getting_started_greetings">
            To speed things up, you can check out our blog post on getting
            started with FormPress{' '}
            <a
              href="https://formpress.org/blog-details/027-getting-started"
              target="_blank"
              rel="noopener noreferrer">
              here
            </a>
            .
          </p>
          <iframe
            title="Feedback Form"
            style={{
              width: '700px',
              height: '600px'
            }}
            scrolling={'no'}
            src={iframeSrc}></iframe>
        </div>
      </Modal>
    )
  }

  render() {
    const { forms, loading } = this.state
    let roleLimit = 5
    if (this.props.generalContext.auth.permission.admin) {
      roleLimit = 0
    } else {
      roleLimit = parseInt(this.props.generalContext.auth.permission.formLimit)
    }

    let canShare = false

    if (
      this.props.generalContext.auth.permission.canShare ||
      this.props.generalContext.auth.permission.admin
    ) {
      canShare = true
    }

    const formsAndShares = forms.reduce(
      (ctx, el) => {
        if (el.permissions === undefined) {
          ctx.owned.push(el)
        } else {
          ctx.shared.push(el)
        }
        return ctx
      },
      { owned: [], shared: [] }
    )

    return (
      <div>
        <div className="forms">
          {this.state.isGettingStartedModalOpen === true
            ? this.renderGettingStartedModal()
            : null}
          {this.state.isModalOpen ? (
            <Modal
              isOpen={this.state.isModalOpen}
              modalContent={this.state.modalContent}
              closeModal={this.handleCloseModalClick}
            />
          ) : null}
          <div className="headerContainer"></div>
          <div className="formsContent">
            {loading.forms ? (
              <div className="forms_loader">
                <DotLoader color={'#9ee048'} loading={true} size={12} />
              </div>
            ) : formsAndShares.owned.length > 0 ? (
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
                      <Link
                        to={`/editor/${form.id}/builder`}
                        title="Go To Form">
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
                          className={`${
                            form.published_version ? 'view' : 'inactive_view'
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
                        {canShare ? (
                          <span
                            title="Share Form"
                            onClick={this.handleFormSharePermissionsClick.bind(
                              this,
                              form
                            )}>
                            <FontAwesomeIcon icon={faUserLock} />
                          </span>
                        ) : (
                          <span
                            className="upgrade-container"
                            title="Upgrade your plan to share with others">
                            <FontAwesomeIcon icon={faUserLock} />
                            <div className="popoverText">
                              <a
                                href={global.env.FE_UPGRADE_LINK}
                                target="_blank"
                                rel="noopener noreferrer">
                                {' '}
                                Upgrade your plan
                              </a>{' '}
                              to share with others.
                            </div>
                          </span>
                        )}
                        <span
                          title="Delete Form"
                          onClick={this.handleFormDeleteClick.bind(this, form)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </span>
                        <Link
                          to={`/editor/${form.id}/builder`}
                          title="Edit Form">
                          <FontAwesomeIcon icon={faPen} />
                        </Link>
                        {roleLimit === 0 ||
                        roleLimit > formsAndShares.owned.length ? (
                          <span
                            title="Clone Form"
                            onClick={this.handleFormCloneClick.bind(
                              this,
                              form
                            )}>
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
                data={formsAndShares.owned}
              />
            ) : (
              <div className="no_forms_container">
                <p>
                  Oops! It looks like you don&apos;t have any forms yet. Click
                  the button below to create your first form!
                </p>
              </div>
            )}
          </div>
          {formsAndShares.shared.length > 0 ? (
            <div className="formsContent shared">
              <div className="sharedWithMe">
                Shared With Me{' '}
                <FontAwesomeIcon icon={faLink} className="clipboardIcon" />
              </div>
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
                      <>
                        {form.permissions.edit || form.permissions.read ? (
                          <Link
                            to={`/editor/${form.id}/builder`}
                            title="Go To Form">
                            {form.title}
                          </Link>
                        ) : (
                          <span>{form.title}</span>
                        )}
                      </>
                    ),
                    className: 'name',
                    title: ' '
                  },
                  {
                    label: 'Submissions',
                    content: (form) => (
                      <div className="responsesContainer">
                        {form.permissions.data ? (
                          <>
                            <Link
                              to={{
                                pathname: '/data',
                                state: {
                                  form_id: form.id,
                                  submissionFilterSelectors: {
                                    showUnread: false
                                  }
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
                                {form.unreadCount > 99
                                  ? '99'
                                  : form.unreadCount}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <div className="responseCount">-</div>
                        )}
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
                          className={`${
                            form.published_version ? 'view' : 'inactive_view'
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
                        <>
                          {form.permissions.edit || form.permissions.read ? (
                            <Link
                              to={`/editor/${form.id}/builder`}
                              title="Edit Form">
                              <FontAwesomeIcon icon={faPen} />
                            </Link>
                          ) : (
                            ''
                          )}
                        </>
                        <>
                          {form.permissions.edit || form.permissions.read ? (
                            roleLimit === 0 ||
                            roleLimit > formsAndShares.owned.length ? (
                              <span
                                title="Clone Form"
                                onClick={this.handleFormCloneClick.bind(
                                  this,
                                  form
                                )}>
                                <FontAwesomeIcon icon={faClone} />
                              </span>
                            ) : (
                              <span
                                className="inactive_clone"
                                title="Form limit reached">
                                <FontAwesomeIcon icon={faClone} />
                              </span>
                            )
                          ) : (
                            ''
                          )}
                        </>
                      </div>
                    )
                  }
                ]}
                data={formsAndShares.shared}
              />
            </div>
          ) : (
            ''
          )}
          <div className="newButtonContainer">
            {roleLimit === 0 || roleLimit > formsAndShares.owned.length ? (
              <Link to="/editor/new">Create a new form</Link>
            ) : (
              <span
                className="disabledNewForm"
                onMouseEnter={(e) => {
                  const rect = e.target.getBoundingClientRect()
                  const rightDiff = rect.right - e.clientX
                  const rightPercentage = (100 * rightDiff) / rect.width
                  const bottomDiff = rect.bottom - e.clientY
                  const bottomPercentage = (100 * bottomDiff) / rect.height
                  const popover = document.getElementById(
                    'createNewForm-popover'
                  )
                  popover.style.position = 'fixed'
                  popover.style.top =
                    (bottomPercentage > 20 ? e.clientY - 20 : e.clientY - 80) +
                    'px'
                  popover.style.left =
                    (rightPercentage < 20 ? e.clientX - 130 : e.clientX) + 'px'
                }}>
                Create a new form
                <div id="createNewForm-popover" className="popoverText">
                  Form limit reached.
                  <a
                    href={global.env.FE_UPGRADE_LINK}
                    target="_blank"
                    rel="noopener noreferrer">
                    {' '}
                    Upgrade your plan for more.
                  </a>
                </div>
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }
}
