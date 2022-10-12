import React, { Component } from 'react'
import Renderer from '../Renderer'
import Modal from '../common/Modal'
import './GoogleDrive.css'
import { api } from '../../helper'
import * as Elements from '../elements'

export default class GoogleDrive extends Component {
  static metaData = {
    icon:
      'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    displayText: 'Google Drive',
    name: 'GoogleDrive'
  }

  constructor(props) {
    super(props)
    this.state = {
      folderName: this.props.form.title,
      submissionIdentifier: {},
      display: this.props.activeStatus ? 'active' : 'description',
      inputElements: [],
      isModalOpen: false,
      modalContent: {}
    }

    this.handleAuthenticateClick = this.handleAuthenticateClick.bind(this)
    this.handleActivateClick = this.handleActivateClick.bind(this)
    this.handlePauseClick = this.handlePauseClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleUpdateClick = this.handleUpdateClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)

    this.removeIntegration = this.removeIntegration.bind(this)

    this.handleSubmissionIdentifierChange = this.handleSubmissionIdentifierChange.bind(
      this
    )

    this.handleFolderNameChange = this.handleFolderNameChange.bind(this)
    this.filterElementsWithInput = this.filterElementsWithInput.bind(this)
  }

  componentDidMount() {
    const props = this.props

    if (props.integrationObject) {
      let { submissionIdentifier } = props.integrationObject

      const selectedELement = props.form.props.elements.find(
        (element) =>
          element.id === submissionIdentifier.id ||
          element.type === submissionIdentifier.type
      )

      if (selectedELement) {
        this.setState({ submissionIdentifier })
      } else {
        this.setState({ submissionIdentifier: {} })
      }
    }

    window.addEventListener('message', function (event) {
      if (event.data?.type === 'gdriveCallback') {
        const {
          base64Token,
          folderID,
          submissionIdentifierId,
          submissionIdentifierType
        } = event.data

        props.setIntegration({
          type: GoogleDrive.metaData.name,
          active: true,
          value: base64Token,
          folder: folderID,
          submissionIdentifier: {
            id: submissionIdentifierId,
            type: submissionIdentifierType
          }
        })
      }
    })

    this.filterElementsWithInput()
  }

  async componentDidUpdate(prevProps) {
    if (this.props.activeStatus !== prevProps.activeStatus) {
      await this.props.handlePublishClick()
    }
  }

  filterElementsWithInput() {
    const elements = this.props.form.props.elements
    const inputElements = []

    elements.forEach((elem) => {
      let elementType = elem.type
      if (Elements[elementType].metaData.group === 'inputElement') {
        const inputElement = {
          display: elem.label,
          value: elem.id,
          type: elem.type
        }
        inputElements.push(inputElement)
      }
    })
    this.setState({ inputElements: inputElements })
  }

  async handleActivateClick() {
    if (this.props.integrationValue) {
      this.props.setIntegration({
        type: GoogleDrive.metaData.name,
        active: true
      })
      this.setState({
        display: 'active'
      })
    } else {
      this.setState({ display: 'configuration' })
    }
    await this.props.handlePublishClick()
  }

  async handleAuthenticateClick() {
    const { submissionIdentifier, folderName } = this.state
    await this.props.handlePublishClick()
    let { success, data } = await api({
      resource: `/api/integrations/googledrive/authenticate`,
      method: 'post',
      body: { submissionIdentifier, folderName }
    })
    if (success) {
      window.open(data, 'Authenticate With Google', 'width=800,height=600')
      this.setState({
        display: 'active'
      })
    } else {
      this.setState({
        display: 'description'
      })
    }
  }

  async handlePauseClick() {
    this.setState({
      display: 'description'
    })
    this.props.setIntegration({
      type: GoogleDrive.metaData.name,
      active: false
    })
    await this.props.handlePublishClick()
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

    modalContent.content = (
      <div>
        You will not be able to receive submission data to the same folder
        again. Are you sure to proceed?
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  async removeIntegration() {
    this.props.setIntegration({
      type: GoogleDrive.metaData.name,
      active: false,
      folder: false,
      value: false,
      submissionIdentifier: {}
    })
    this.setState({
      display: 'description',
      folderName: this.props.form.title,
      submissionIdentifier: {}
    })
    this.setState({ isModalOpen: false })
  }

  handleEditClick() {
    this.setState({
      display: 'update',
      submissionIdentifier: this.state.submissionIdentifier
    })
  }

  async handleUpdateClick() {
    this.setState({
      display: 'active'
    })
    this.props.setIntegration({
      type: GoogleDrive.metaData.name,
      submissionIdentifier: {
        id: this.state.submissionIdentifier.id,
        type: this.state.submissionIdentifier.type
      }
    })
    await this.props.handlePublishClick()
  }

  handleFolderNameChange(elem, e) {
    this.setState({
      folderName: e.target.value
    })
  }

  handleSubmissionIdentifierChange(elem, e) {
    const selectedSubmissionIdentifier = this.state.inputElements.find(
      (i) => i.value === parseInt(e.target.value)
    )

    this.setState({
      submissionIdentifier: {
        id: selectedSubmissionIdentifier.value,
        type: selectedSubmissionIdentifier.type
      }
    })
  }

  render() {
    console.log(this.props, 'heh')
    const submissionIdentifierElement = this.state.inputElements.find(
      (e) => e.value === parseInt(this.state.submissionIdentifier.id)
    )
    let display
    if (this.props.activeStatus && this.state.display !== 'update') {
      display = (
        <>
          <div className="integration-active">
            You have successfully integrated your form to{' '}
            {GoogleDrive.metaData.displayText}! Submissions will be uploaded to
            the folder below. <br />
            <a
              href={
                'https://drive.google.com/drive/folders/' +
                this.props.integrationObject.folder
              }
              target="_blank"
              rel="noopener noreferrer">
              https://drive.google.com/drive/folders/
              {this.props.integrationObject.folder}
            </a>
          </div>
          <div className="integration-controls">
            <div className="pause-integration">
              <button type="button" onClick={this.handlePauseClick}>
                PAUSE
              </button>
            </div>
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
      this.state.display !== 'configuration'
    ) {
      display = (
        <>
          <div className="integration-motto">
            Have your submission data stored in a folder!
          </div>
          <div className="integration-text">
            You can create a unique folder for each form, name it the way you
            like, and have your submissions stored as PDF! Google Drive saves
            your files and makes it possible for you to reach them anywhere!
            Plus, it’s now super easy to share your files with your team or
            friends!
          </div>
          <div className="activation-button">
            <button
              className={
                this.props.activeStatus
                  ? 'active-authentication'
                  : 'start-authentication'
              }
              type="button"
              onClick={
                this.props.activeStatus ? null : this.handleActivateClick
              }>
              {this.props.activeStatus ? 'ACTIVE' : 'ACTIVATE'}
            </button>
          </div>
        </>
      )
    } else if (this.state.display === 'configuration') {
      display = (
        <>
          <div className="integration-configuration">
            <div className="integration-inputs">
              <Renderer
                className="folder"
                theme="gleam"
                handleFieldChange={this.handleFolderNameChange}
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'TextBox',
                        label: 'Type a Folder Name',
                        placeholder: 'Folder Name',
                        value: this.state.folderName
                      }
                    ]
                  }
                }}
              />
              <Renderer
                handleFieldChange={this.handleSubmissionIdentifierChange}
                className="file"
                theme="gleam"
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'Dropdown',
                        label: 'Select a Question as Submission Identifier',
                        value: this.state.submissionIdentifier.id,
                        options: this.state.inputElements
                      }
                    ]
                  }
                }}
              />
            </div>
            <div className="file-name-preview">
              <div className="message">Your submissions will be saved as:</div>
              <div className="value">
                <div className="chosen-label filename-block">
                  {this.state.submissionIdentifier.id !== undefined
                    ? submissionIdentifierElement.display
                    : ''}
                </div>
                <span className="filename-separator"> - </span>
                <span className="filename-block">Submission Date</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="complete-authentication"
            onClick={() => this.handleAuthenticateClick()}>
            AUTHENTICATE
          </button>
        </>
      )
    } else if (this.props.activeStatus && this.state.display === 'update') {
      display = (
        <>
          <div className="integration-configuration">
            <div className="integration-inputs">
              <Renderer
                handleFieldChange={this.handleSubmissionIdentifierChange}
                className="file"
                theme="gleam"
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'Dropdown',
                        label: 'Select a Question as Submission Identifier',
                        value: this.state.submissionIdentifier.id,
                        options: [...this.state.inputElements]
                      }
                    ]
                  }
                }}
              />
            </div>
            <div className="file-name-preview">
              <div className="message">Your submissions will be saved as:</div>
              <div className="value">
                <div className="chosen-label">
                  {this.state.submissionIdentifier.id !== undefined
                    ? submissionIdentifierElement.display + ' - '
                    : ''}
                </div>
                Submission Date.pdf
              </div>
            </div>
          </div>

          <button
            type="button"
            className="update-integration"
            onClick={() => this.handleUpdateClick()}>
            UPDATE
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
          <img
            src={GoogleDrive.metaData.icon}
            className="logo"
            alt="google-drive-logo"
          />
          <div className="title">{GoogleDrive.metaData.displayText}</div>
        </div>
        <div className="integration-content">{display}</div>
      </div>
    )
  }
}
