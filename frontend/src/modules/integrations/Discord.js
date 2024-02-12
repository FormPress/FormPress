import React, { Component } from 'react'
import Modal from '../common/Modal'
import './Discord.css'

import * as Elements from '../elements'
import Renderer from '../Renderer'
import { api } from '../../helper'

export default class Discord extends Component {
  static metaData = {
    icon:
      'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg',
    displayText: 'Discord',
    name: 'Discord'
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
      fieldLimitReached: false
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
    this.renderInputElementSelection = this.renderInputElementSelection.bind(
      this
    )
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
    const { webhookUrl, inputElements, customizeInputs } = this.state
    const errorDialog = document.querySelector('.field-limit-reached-message')

    if (inputElements.chosen.length > 250) {
      this.setState({
        fieldLimitReached: true
      })
      errorDialog.classList.remove('dn')
    } else {
      if (!errorDialog.classList.contains('dn')) {
        errorDialog.classList.add('dn')
      }

      this.setState({
        fieldLimitReached: false
      })

      const { success } = await api({
        resource: '/api/discord/init',
        method: 'POST',
        body: {
          url: webhookUrl,
          formTitle: this.props.form.title
        }
      })

      if (success) {
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

        const tempIntegrationObject = {
          type: Discord.metaData.name,
          active: true,
          value: webhookUrl,
          chosenInputs,
          customizeInputs,
          paused: false
        }
        this.setState({
          tempIntegrationObject,
          display: 'active',
          invalidUrl: false,
          fieldLimitReached: false
        })

        this.props.setIntegration(tempIntegrationObject)
        this.props.updateDbFormIntegrations(Discord.metaData.name)
      } else {
        //IF THE URL IS INVALID
        this.setState({
          invalidUrl: true,
          webhookUrl: ''
        })
        document.querySelector('.integration-header').scrollIntoView({
          behavior: 'smooth'
        })
        this.props.setIntegration({
          type: Discord.metaData.name,
          active: false,
          value: ''
        })
        this.props.updateDbFormIntegrations(Discord.metaData.name)
      }
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
      type: Discord.metaData.name,
      active: false,
      value: '',
      paused: false,
      customizeInputs: false,
      chosenInputs: [],
      inputElements: { all, chosen: [] }
    }
    this.props.setIntegration(tempIntegrationObject)
    this.props.updateDbFormIntegrations(Discord.metaData.name)

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
      type: Discord.metaData.name,
      paused: true
    })
    this.props.updateDbFormIntegrations(Discord.metaData.name)
  }
  async handleResumeClick() {
    this.setState({
      tempIntegrationObject: {
        ...this.state.tempIntegrationObject,
        paused: false
      }
    })

    this.props.setIntegration({
      type: Discord.metaData.name,
      paused: false
    })

    this.props.updateDbFormIntegrations(Discord.metaData.name)
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
          className={
            this.state.fieldLimitReached
              ? 'field-limit-reached input-elems'
              : 'input-elems'
          }
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
            Get instant updates on your form submissions with Discord!
          </div>
          <div className="integration-text">
            With the Discord Webhook integration, you can receive real-time
            notifications in your Discord channels. All you have to do is enter
            your Discord Webhook URL, and every time a form is submitted, its
            data will be sent straight to the designated Discord channel. No
            need to constantly check your form builder for new submissions, let
            Discord do the work for you!
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
                          'https://discord.com/api/webhooks/id/token',

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
              <div className="field-limit-reached-message dn">
                You can select maximum 250 fields.
              </div>
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
            You have successfully integrated your form with your discord
            channel!
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
            src={Discord.metaData.icon}
            className="logo"
            alt="discord-logo"
          />
          <div className="title">{Discord.metaData.displayText}</div>
        </div>
        <div className="integration-content">{display}</div>
      </div>
    )
  }
}
