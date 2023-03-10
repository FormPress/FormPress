import React, { Component } from 'react'
import Modal from '../common/Modal'
import './Slack.css'

import * as Elements from '../elements'
import Renderer from '../Renderer'
import { api } from '../../helper'

export default class Slack extends Component {
  static metaData = {
    icon:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg',
    displayText: 'Slack',
    name: 'Slack'
  }

  constructor(props) {
    super(props)
    this.state = {
      display: this.props.activeStatus ? 'active' : 'description',
      inputElements: [],
      isModalOpen: false,
      modalContent: {},
      tempIntegrationObject: { ...this.props.integrationObject },
      webhookUrl: '',
      invalidUrl: false
    }

    this.filterElementsWithInput = this.filterElementsWithInput.bind(this)
    this.handleConfigureWebhook = this.handleConfigureWebhook.bind(this)
    this.handleActivateWebhook = this.handleActivateWebhook.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.removeIntegration = this.removeIntegration.bind(this)
    this.handleResumeClick = this.handleResumeClick.bind(this)
    this.handlePauseClick = this.handlePauseClick.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleWebhookUrlChange = this.handleWebhookUrlChange.bind(this)
    this.handleChooseInputElements = this.handleChooseInputElements.bind(this)
  }

  componentDidMount() {
    this.filterElementsWithInput()
  }

  componentWillUnmount() {}

  async componentDidUpdate(prevProps) {
    if (this.props.activeStatus !== prevProps.activeStatus) {
      await this.props.handlePublishClick()
    }
  }

  filterElementsWithInput() {
    const elements = this.props.form.props.elements
    const all = []
    let chosen = []

    elements
      .filter((e) => {
        return Elements[e.type].metaData.group === 'inputElement'
      })
      .forEach((elem, index) => {
        const inputElement = {
          label: elem.label,
          id: elem.id,
          type: elem.type
        }
        all.push(inputElement)
        chosen.push(index)
      })
    if (this.props.integrationObject) {
      chosen = this.props.integrationObject.inputElements.chosen
    }

    this.setState({ inputElements: { all, chosen } })
  }

  handleChooseInputElements(e, elem) {
    const { inputElements } = this.state

    if (e.id === 21) {
      // this is the 'Select All' option
      if (e.value === false) {
        inputElements.chosen = inputElements.all.map((elem, index) => index)
        this.setState({ inputElements })
        return
      } else {
        inputElements.chosen = []
        this.setState({ inputElements })
        return
      }
    }

    const clickedIndex = parseInt(elem.target.value)

    if (inputElements.chosen.includes(clickedIndex)) {
      inputElements.chosen.splice(inputElements.chosen.indexOf(clickedIndex), 1)
    } else {
      inputElements.chosen.push(clickedIndex)
    }
    inputElements.chosen.sort((a, b) => {
      return a - b
    })
    this.setState({ inputElements })
  }

  handleWebhookUrlChange(elem, e) {
    const url = e.target.value

    this.setState({ webhookUrl: url })
  }
  handleConfigureWebhook() {
    this.setState({ display: 'configuration' })
  }

  async handleActivateWebhook() {
    const { webhookUrl, inputElements } = this.state

    const { success } = await api({
      resource: '/api/slack/init',
      method: 'POST',
      body: {
        url: webhookUrl,
        formTitle: this.props.form.title
      }
    })

    if (success) {
      const chosenInputs = this.state.inputElements.chosen.map((elem) => {
        return this.state.inputElements.all[elem]
      })

      const tempIntegrationObject = {
        type: Slack.metaData.name,
        active: true,
        value: webhookUrl,
        chosenInputs,
        inputElements
      }
      this.setState({
        tempIntegrationObject,
        display: 'active',
        invalidUrl: false
      })

      this.props.setIntegration(tempIntegrationObject)
      await this.props.handlePublishClick()
    } else {
      //IF THE URL IS INVALID
      this.setState({
        invalidUrl: true,
        webhookUrl: ''
      })
      const element = document.querySelector('.integration-header')
      element.scrollIntoView({
        behavior: 'smooth'
      })
      this.props.setIntegration({
        type: Slack.metaData.name,
        active: false,
        value: ''
      })
    }
  }

  handleCloseModalClick() {
    this.setState({ isModalOpen: false, modalContent: {} })
  }

  handleRemoveClick(e) {
    e.preventDefault()
    const modalContent = {
      header: 'Remove integration?',
      status: 'warning'
    }
    modalContent.dialogue = {
      negativeText: 'Remove',
      negativeClick: this.removeIntegration,
      abortText: 'Cancel',
      abortClick: this.handleCloseModalClick
    }

    modalContent.content = <div>Are you sure to proceed?</div>

    this.setState({ modalContent, isModalOpen: true })
  }

  async removeIntegration() {
    this.props.setIntegration({
      type: Slack.metaData.name,
      active: false,
      value: ''
    })
    this.setState({
      display: 'description'
    })
    this.setState({ isModalOpen: false })
  }

  handleEditClick() {
    let { inputElements } = this.state
    inputElements.chosen = this.props.integrationObject.inputElements.chosen
    this.setState({
      inputElements,
      display: 'configuration',
      webhookUrl: this.state.tempIntegrationObject.value
    })
  }

  async handlePauseClick() {
    this.setState({
      tempIntegrationObject: {
        ...this.state.tempIntegrationObject,
        paused: true
      }
    })
    this.props.setIntegration({
      type: Slack.metaData.name,
      paused: true
    })
    await this.props.handlePublishClick()
  }
  async handleResumeClick() {
    this.setState({
      tempIntegrationObject: {
        ...this.state.tempIntegrationObject,
        paused: false
      }
    })

    this.props.setIntegration({
      type: Slack.metaData.name,
      paused: false
    })

    await this.props.handlePublishClick()
  }
  render() {
    let { inputElements, webhookUrl } = this.state

    let display
    let paused
    if (this.props.tempIntegrationObject?.paused !== undefined) {
      paused = this.props.tempIntegrationObject.paused
    } else {
      paused = this.state.tempIntegrationObject.paused
    }

    if (
      paused ||
      (this.props.activeStatus && this.state.display === 'active')
    ) {
      display = (
        <>
          <div className="integration-active">
            You have successfully integrated your form with your slack channel!
          </div>
          <div className="integration-controls">
            {paused ? (
              <div className="resume-integration">
                <button type="button" onClick={this.handleResumeClick}>
                  RESUME
                </button>
              </div>
            ) : (
              <div className="pause-integration">
                <button type="button" onClick={this.handlePauseClick}>
                  PAUSE
                </button>
              </div>
            )}
            <div className="edit-integration">
              <button type="button" onClick={this.handleEditClick}>
                EDIT
              </button>
            </div>
            <div className="remove-integration">
              <button type="button" onClick={this.handleRemoveClick}>
                REMOVE
              </button>
            </div>
          </div>
        </>
      )
    } else if (
      this.props.activeStatus === false &&
      this.state.display === 'description'
    ) {
      // DESCRIPTION
      display = (
        <>
          <div className="integration-motto">
            Get instant updates on your form submissions with Slack!
          </div>
          <div className="integration-text">
            The Slack Webhook integration allows you to receive real-time
            notifications of form submissions directly in your Slack channels.
            Simply set up the integration with your Slack Webhook URL and never
            miss a submission again. All of your form data will be delivered
            straight to the designated Slack channel, keeping you organized and
            up-to-date.
          </div>
          <div className="activation-button">
            <button type="button" onClick={this.handleConfigureWebhook}>
              Start Configuration
            </button>
          </div>
        </>
      )
    } else if (this.state.display === 'configuration') {
      // CONFIGURATION
      display = (
        <>
          <div className="integration-configuration">
            <div className="integration-inputs">
              <Renderer
                handleFieldChange={this.handleWebhookUrlChange}
                className={
                  this.state.invalidUrl
                    ? 'invalid-url webhookUrl'
                    : 'webhookUrl'
                }
                theme="infernal"
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'TextBox',
                        placeholder:
                          'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX',

                        label: 'Please enter webhook url',
                        value: webhookUrl
                      }
                    ]
                  }
                }}
              />
              <div className="string-vars-label">Choose elements</div>
              <Renderer
                handleFieldChange={this.handleChooseInputElements}
                theme="infernal"
                allowInternal={true}
                className="input-elems"
                form={{
                  props: {
                    elements: [
                      {
                        id: 21,
                        type: 'Checkbox',
                        options: ['Select All'],
                        value:
                          inputElements.chosen.length ===
                          inputElements.all.length
                      },
                      {
                        id: 22,
                        type: 'Checkbox',
                        options: this.state.inputElements.all.map((elem) => {
                          return elem.label
                        }),
                        value: this.state.inputElements.chosen
                      }
                    ]
                  }
                }}
              />
            </div>
          </div>
          <button
            type="button"
            className="complete-authentication"
            onClick={() => this.handleActivateWebhook()}>
            Activate Webhook
          </button>
        </>
      )
    }
    return (
      <div className="integration-wrapper col-10-16">
        {this.state.isModalOpen ? (
          <Modal
            isOpen={this.state.isModalOpen}
            modalContent={this.state.modalContent}
            closeModal={this.handleCloseModalClick}
          />
        ) : null}
        <div className="close-button">
          <span
            className="close-integration"
            onClick={() => this.props.handleCloseIntegrationClick()}>
            x
          </span>
        </div>
        <div className="integration-header">
          <img src={Slack.metaData.icon} className="logo" alt="slack-logo" />
          <div className="title">{Slack.metaData.displayText}</div>
        </div>
        <div className="integration-content">{display}</div>
      </div>
    )
  }
}
