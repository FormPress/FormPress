import React, { Component } from 'react'
import './APIKeys.css'
import { api } from '../../helper'
import Table from '../common/Table'
import Moment from 'react-moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone, faTrash } from '@fortawesome/free-solid-svg-icons'
import Modal from '../common/Modal'
import CopyToClipboard from '../common/CopyToClipboard'

export default class APIKeys extends Component {
  static componentName = 'APIKeys'
  static path = '/settings/api_keys'
  static menuText = 'API Keys'

  constructor(props) {
    super(props)
    this.state = {
      apiKeys: [],
      newApiKeyName: 'New API Key',
      modalContent: {},
      isModalOpen: false
    }

    this.fetchApiKeys = this.fetchApiKeys.bind(this)
    this.handleApiKeyCreateClick = this.handleApiKeyCreateClick.bind(this)
    this.handleApiKeyDeleteClick = this.handleApiKeyDeleteClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.deleteApiKey = this.deleteApiKey.bind(this)
    this.createApiKey = this.createApiKey.bind(this)
    this.handleNewApiKeyNameChange = this.handleNewApiKeyNameChange.bind(this)
  }

  async componentDidMount() {
    await this.fetchApiKeys()
  }

  async fetchApiKeys() {
    const { data: apiKeys } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/api-key`
    })

    this.setState({ apiKeys })
  }

  handleCloseModalClick() {
    this.setState({ isModalOpen: false, modalContent: {} })
  }

  handleApiKeyCreateClick(e) {
    e.preventDefault()
    const modalContent = {
      header: 'Create API Key',
      status: 'information'
    }

    modalContent.dialogue = {
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick,
      positiveText: 'Create',
      positiveClick: () => this.createApiKey(),
      inputValue: () => {
        return this.state.newApiKeyName
      },
      inputOnChange: (e) => this.handleNewApiKeyNameChange(e)
    }

    modalContent.content = <div>Please specify a name for the new API key.</div>

    this.setState({ modalContent, isModalOpen: true })
  }

  handleNewApiKeyNameChange(e) {
    let name = e.target.value
    let limit = 50
    if (name.length >= limit) {
      name = name.substr(0, limit)
      name
        .replace(/<span(.*?)>(.*?)<\/span>/, '')
        .replace(/(<([^>]+)>)/gi, '')
        .trim()
    }
    this.setState({ newApiKeyName: name })
  }

  handleApiKeyDeleteClick(e, apiKey) {
    e.preventDefault()
    const modalContent = {
      header: 'Delete API Key?',
      status: 'warning'
    }

    modalContent.dialogue = {
      negativeText: 'Delete',
      negativeClick: () => this.deleteApiKey(apiKey),
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick
    }

    modalContent.content = (
      <div>
        Selected API key will be deleted <strong>permanently.</strong> Are you
        sure you want to proceed?
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  async deleteApiKey(apiKey) {
    const { auth } = this.props.generalContext

    const result = await api({
      resource: `/api/users/${auth.user_id}/api-key`,
      method: 'DELETE',
      useAuth: true,
      body: {
        apiKeyId: apiKey.id
      }
    })

    if (result.status !== 200) {
      this.setState({
        modalContent: {
          header: 'Error',
          status: 'error',
          content: <div>{result.data.message}</div>
        }
      })

      return
    }

    await this.fetchApiKeys()

    this.handleCloseModalClick()
  }

  async createApiKey() {
    const { auth } = this.props.generalContext

    const { newApiKeyName } = this.state

    const result = await api({
      resource: `/api/users/${auth.user_id}/api-key`,
      method: 'POST',
      useAuth: true,
      body: {
        name: newApiKeyName
      }
    })

    if (result.status !== 200) {
      this.setState({
        modalContent: {
          header: 'Error',
          status: 'error',
          content: <div>{result.data.message}</div>
        }
      })

      return
    }

    await this.fetchApiKeys()

    this.handleCloseModalClick()
  }

  render() {
    const { apiKeys } = this.state

    return (
      <>
        <Modal
          isOpen={this.state.isModalOpen}
          modalContent={this.state.modalContent}
          closeModal={this.handleCloseModalClick}
        />
        <div className="apikeys-wrapper">
          <div className="settings_header">API Keys</div>
          <Table
            columns={[
              {
                label: '#',
                content: (entry, index) => <span key="1">{index + 1}</span>,
                className: 'apiKeyIndex'
              },
              {
                label: 'Name',
                content: (entry) => (
                  <span key="2" title={entry.name}>
                    {entry.name}
                  </span>
                ),
                className: 'name',
                title: ' '
              },
              {
                label: 'API Key',
                content: (entry) => entry.api_key,
                className: 'apiKey',
                title: ' '
              },
              {
                label: 'Created',
                content: (entry) => [
                  <Moment fromNow ago date={entry.created_at} key="1" />,
                  <span key="2">{' ago'}</span>
                ],
                className: 'createdAt'
              },
              {
                label: 'Actions',
                className: 'actionsTh',
                content: (apiKey) => (
                  <div className="actions">
                    <CopyToClipboard clipboardData={apiKey.api_key}>
                      <span title="Copy to clipboard">
                        <FontAwesomeIcon icon={faClone} />
                      </span>
                    </CopyToClipboard>
                    <span
                      title="Delete Key"
                      onClick={(e) => this.handleApiKeyDeleteClick(e, apiKey)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </span>
                  </div>
                )
              }
            ]}
            data={apiKeys}
          />
          <div>
            <button
              className="createApiKeyButton"
              type={'button'}
              onClick={(e) => this.handleApiKeyCreateClick(e)}>
              {' '}
              Create API Key{' '}
            </button>
          </div>
        </div>
      </>
    )
  }
}
