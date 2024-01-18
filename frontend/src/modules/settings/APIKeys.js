import React, { Component } from 'react'
import './APIKeys.css'
import { api } from '../../helper'
import Table from '../common/Table'
import Moment from 'react-moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone, faTrash } from '@fortawesome/free-solid-svg-icons'

export default class APIKeys extends Component {
  static componentName = 'APIKeys'
  static path = '/settings/api_keys'
  static menuText = 'API Keys'

  constructor(props) {
    super(props)
    this.state = {
      apiKeys: [],
      modalContent: {},
      isModalOpen: false
    }

    this.handleApiKeyDeleteClick = this.handleApiKeyDeleteClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.deleteApiKey = this.deleteApiKey.bind(this)
  }

  async componentDidMount() {
    const { data: apiKeys } = await api({
      resource: `/api/users/${this.props.generalContext.auth.user_id}/api-key`
    })

    this.setState({ apiKeys })
  }

  handleCloseModalClick() {
    this.setState({ isModalOpen: false, modalContent: {} })
  }

  handleApiKeyCreateClick(apiKey, e) {
    e.preventDefault()
    // TODO: implement
  }

  handleApiKeyDeleteClick(apiKey, e) {
    e.preventDefault()
    const modalContent = {
      header: 'Delete API Key?',
      status: 'warning'
    }

    modalContent.dialogue = {
      negativeText: 'Delete',
      negativeClick: this.deleteApiKey(apiKey),
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
    }

    setTimeout(() => {
      this.handleCloseModalClick()
    }, 1500)
  }

  render() {
    const { apiKeys } = this.state

    return (
      <div className="apikeys-wrapper">
        <Table
          columns={[
            {
              label: '#',
              content: (entry, index) => <span key="1">{index + 1}</span>,
              className: 'apiKeyIndex'
            },
            {
              label: 'Name',
              content: (entry) => entry.name,
              className: 'name',
              title: ' '
            },
            {
              label: 'API Key',
              content: (entry) => entry.api_key,
              className: 'name',
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
              content: (form) => (
                <div className="actions">
                  <span
                    title="Copy Key"
                    onClick={() => console.log('copy key')}>
                    <FontAwesomeIcon icon={faClone} />
                  </span>
                  <span
                    title="Delete Key"
                    onClick={() => console.log('deleteclick')}>
                    <FontAwesomeIcon icon={faTrash} />
                  </span>
                </div>
              )
            }
          ]}
          data={apiKeys}
        />
      </div>
    )
  }
}
