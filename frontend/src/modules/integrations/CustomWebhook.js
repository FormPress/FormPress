import React, { Component } from 'react'
import Modal from '../common/Modal'
import './CustomWebhook.css'

import * as Elements from '../elements'
import Renderer from '../Renderer'

export default class CustomWebhook extends Component {
  static metaData = {
    icon: 'https://static.formpress.org/images/webhooks-logo.svg',
    displayText: 'Custom Webhook',
    name: 'CustomWebhook'
  }

  constructor(props) {
    super(props)
    this.state = {
      display: this.props.activeStatus ? 'active' : 'description',
      customizeInputs:
        this.props.integrationObject === null
          ? false
          : this.props.integrationObject.customizeInputs,
      inputElements: [],
      isModalOpen: false,
      modalContent: {},
      tempIntegrationObject: { ...this.props.integrationObject },
      webhookUrl:
        this.props.integrationObject === null
          ? ''
          : this.props.integrationObject.value,
      invalidUrl: false,
      examplePayload: {
        metadata: {
          formId: 7,
          submissionId: 28,
          formTitle: 'Untitled Form',
          submissionDate: '2023-02-27 12:34:56 UTC'
        },
        entries: [
          { question: 'question', answer: 'answer' },
          { question: 'What is your name', answer: 'John Doe' }
        ]
      }
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
    this.toggleCustomizeInputs = this.toggleCustomizeInputs.bind(this)
    this.renderInputElementSelection =
      this.renderInputElementSelection.bind(this)
  }

  componentDidMount() {
    this.filterElementsWithInput()
  }

  filterElementsWithInput() {
    const elements = this.props.savedForm.props.elements
    const all = []
    let chosen = []

    elements
      .filter((e) => {
        return Elements[e.type].metaData.group === 'inputElement'
      })
      .forEach((elem) => {
        const inputElement = {
          label: elem.label,
          id: elem.id,
          type: elem.type
        }
        all.push(inputElement)
      })
    if (this.props.integrationObject) {
      chosen = this.props.integrationObject.chosenInputs.map((elem) => elem.id)
    }

    this.setState({ inputElements: { all, chosen } })
  }

  toggleCustomizeInputs() {
    this.setState((prevState) => ({
      customizeInputs: !prevState.customizeInputs
    }))
    document.querySelector('.complete-authentication').scrollIntoView({
      behavior: 'smooth'
    })
  }

  handleChooseInputElements(elem) {
    const { inputElements } = this.state

    if (elem.id === 'select all') {
      // this is the 'Select All' option
      if (elem.value === false) {
        inputElements.chosen = inputElements.all.map((elem) => elem.id)
        this.setState({ inputElements })
        return
      } else {
        inputElements.chosen = []
        this.setState({ inputElements })
        return
      }
    }

    const clickedBoundElemId = elem.boundElemId
    const alreadyChosen = inputElements.chosen.includes(clickedBoundElemId)

    if (alreadyChosen) {
      inputElements.chosen.splice(
        inputElements.chosen.indexOf(clickedBoundElemId),
        1
      )
    } else {
      inputElements.chosen.push(clickedBoundElemId)
    }

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
    const { webhookUrl, customizeInputs } = this.state

    let chosenInputs = []
    if (customizeInputs) {
      this.state.inputElements.chosen.forEach((elemId) => {
        const matchedElem = this.state.inputElements.all.find((elem) => {
          return elem.id === elemId
        })
        if (matchedElem !== undefined) {
          chosenInputs.push(matchedElem)
        }
      })
    }
    const urlRegex = /^(https?|http):\/\//i

    if (urlRegex.test(webhookUrl)) {
      const tempIntegrationObject = {
        type: CustomWebhook.metaData.name,
        active: true,
        value: webhookUrl,
        chosenInputs,
        customizeInputs,
        paused: false
      }
      this.setState({
        tempIntegrationObject,
        display: 'active',
        invalidUrl: false
      })

      this.props.setIntegration(tempIntegrationObject)
      this.props.updateDbFormIntegrations(CustomWebhook.metaData.name)
    } else {
      this.setState({ invalidUrl: true, webhookUrl: '' })
      document.querySelector('.integration-header').scrollIntoView({
        behavior: 'smooth'
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
    const { all } = this.state.inputElements

    const tempIntegrationObject = {
      type: CustomWebhook.name,
      active: false,
      value: '',
      paused: false,
      customizeInputs: false,
      chosenInputs: [],
      inputElements: { all, chosen: [] }
    }
    this.props.setIntegration(tempIntegrationObject)
    this.props.updateDbFormIntegrations(CustomWebhook.metaData.name)

    this.setState({
      display: 'description',
      inputElements: { all, chosen: [] },
      webhookUrl: '',
      isModalOpen: false,
      customizeInputs: false,
      tempIntegrationObject
    })
  }

  handleEditClick() {
    this.setState({
      display: 'configuration'
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
      type: CustomWebhook.metaData.name,
      paused: true
    })
    this.props.updateDbFormIntegrations(CustomWebhook.metaData.name)
  }

  async handleResumeClick() {
    this.setState({
      tempIntegrationObject: {
        ...this.state.tempIntegrationObject,
        paused: false
      }
    })
    this.props.setIntegration({
      type: CustomWebhook.metaData.name,
      paused: false
    })

    this.props.updateDbFormIntegrations(CustomWebhook.metaData.name)
  }
  renderInputElementSelection() {
    let { inputElements } = this.state

    const questions = inputElements.all.map((elem, index) => {
      return {
        id: index,
        type: 'Checkbox',
        boundElemId: elem.id,
        options: [elem.label],
        value: inputElements.chosen.includes(elem.id)
      }
    })
    return (
      <>
        <Renderer
          handleFieldChange={this.handleChooseInputElements}
          theme="infernal"
          allowInternal={true}
          className="input-elems"
          form={{
            props: {
              elements: [
                {
                  id: 'select all',
                  type: 'Checkbox',
                  options: ['Questions'],
                  value:
                    inputElements.chosen.length === inputElements.all.length
                },
                ...questions
              ]
            }
          }}
        />
      </>
    )
  }
  render() {
    let { webhookUrl } = this.state
    let display
    let paused
    if (this.props.tempIntegrationObject?.paused !== undefined) {
      paused = this.props.tempIntegrationObject.paused
    } else {
      paused = this.state.tempIntegrationObject.paused
    }

    if (
      this.props.activeStatus === false &&
      this.state.display === 'description'
    ) {
      // DESCRIPTION
      display = (
        <>
          <div className="integration-motto">
            Get instant updates on your form submissions with Custom Webhooks!
          </div>
          <div className="integration-text">
            This Custom Webhook feature is perfect for advanced users who want
            to have complete control over their data and workflow. With this
            feature, you can integrate your forms with any application that
            supports webhooks, giving you real-time notifications for your form
            submissions. Plus, all you need to get started is a webhook URL.
            With just a few simple configuration steps, you can start receiving
            real-time updates on your form submissions in no time!
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
          <div className="payload-preview">
            <pre>
              Example Payload
              <br />
              {JSON.stringify(this.state.examplePayload, null, 4)}
            </pre>
          </div>
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
                        placeholder: 'https://www.example.com/webhook',
                        label: 'Webhook URL',
                        value: webhookUrl
                      }
                    ]
                  }
                }}
              />
              <div className="custom-input-toggle">
                <input
                  type="checkbox"
                  id="switch"
                  checked={this.state.customizeInputs}
                  onChange={this.toggleCustomizeInputs}
                />
                <label htmlFor="switch"></label>{' '}
                <span>Advanced Configuration</span>
              </div>
              {this.state.customizeInputs && this.renderInputElementSelection()}
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
    } else if (
      paused ||
      (this.props.activeStatus && this.state.display === 'active')
    ) {
      display = (
        <>
          <div className="integration-active">
            You have successfully integrated your form with your webhook!
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
    }
    return (
      <div className="integration-wrapper ">
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
          <img
            src={CustomWebhook.metaData.icon}
            className="logo"
            alt="webhook-logo"
          />
          <div className="title">{CustomWebhook.metaData.displayText}</div>
        </div>
        <div className="integration-content">{display}</div>
      </div>
    )
  }
}
