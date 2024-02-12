import React, { Component } from 'react'
import Renderer from '../Renderer'
import Modal from '../common/Modal'
import './GoogleDrive.css'
import { api } from '../../helper'
import * as Elements from '../elements'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder, faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { faGoogleDrive } from '@fortawesome/free-brands-svg-icons'
import _ from 'lodash'
import { DotLoader } from 'react-spinner-overlay'

export default class GoogleDrive extends Component {
  static metaData = {
    icon: 'https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg',
    displayText: 'Google Drive',
    name: 'GoogleDrive'
  }

  constructor(props) {
    super(props)
    this.state = {
      display: this.props.activeStatus ? 'active' : 'description',
      inputElements: [],
      isModalOpen: false,
      modalContent: {},
      tokenClient: null,
      authenticationPopupIsOpen: false,
      tempIntegrationObject: { ...this.props.integrationObject },
      newFolderCreation: true
    }

    this.handleStartAuthentication = this.handleStartAuthentication.bind(this)
    this.handleActivateClick = this.handleActivateClick.bind(this)
    this.handlePauseClick = this.handlePauseClick.bind(this)
    this.handleResumeClick = this.handleResumeClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)

    this.removeIntegration = this.removeIntegration.bind(this)

    this.handleSubmissionIdentifierChange =
      this.handleSubmissionIdentifierChange.bind(this)

    this.handleFolderNameChange = this.handleFolderNameChange.bind(this)
    this.filterElementsWithInput = this.filterElementsWithInput.bind(this)
    this.createPicker = this.createPicker.bind(this)
    this.gisLoaded = this.gisLoaded.bind(this)
    this.handlePickDriveFolder = this.handlePickDriveFolder.bind(this)
    this.showPicker = this.showPicker.bind(this)
    this.checkTokenValidity = this.checkTokenValidity.bind(this)
    this.handleGoogleAuth = this.handleGoogleAuth.bind(this)
    this.tokenMessageListener = this.tokenMessageListener.bind(this)
    this.handleCopyClick = this.handleCopyClick.bind(this)
  }

  componentDidMount() {
    // if gis is not loaded, load it
    if (!window.gapi || !window.google) {
      const gis = document.createElement('script')
      gis.src = 'https://accounts.google.com/gsi/client'
      gis.async = true
      gis.defer = true
      gis.onload = this.gisLoaded
      document.body.appendChild(gis)

      const gapi = document.createElement('script')
      gapi.src = 'https://apis.google.com/js/api.js'
      gapi.async = true
      gapi.defer = true
      gapi.onload = () => {
        const windowGapi = window.gapi
        windowGapi.load('picker')
      }
      document.body.appendChild(gapi)
    }

    window.addEventListener('message', this.tokenMessageListener)

    this.filterElementsWithInput()
  }

  componentWillUnmount() {
    // clean up
    window.removeEventListener('message', this.tokenMessageListener)

    const gis = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]'
    )
    if (gis) {
      gis.remove()
    }
    const gapi = document.querySelector(
      'script[src="https://apis.google.com/js/api.js"]'
    )
    if (gapi) {
      gapi.remove()
    }
  }

  showPicker(access_token) {
    const google = window.google

    const docsView = new google.picker.DocsView()
      .setMode(google.picker.DocsViewMode.LIST)
      .setParent('root')
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)

    const picker = new google.picker.PickerBuilder()
      .addView(docsView)
      .enableFeature(google.picker.Feature.MINE_ONLY)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setSelectableMimeTypes('application/vnd.google-apps.folder')
      .setOAuthToken(access_token)
      .setCallback(this.handlePickDriveFolder)
      .build()
    picker.setVisible(true)
  }

  async checkTokenValidity(access_token) {
    let validToken = true
    await fetch(
      'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=' +
        access_token
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          validToken = false
        }
      })

    return validToken
  }

  async createPicker() {
    const { tokenClient, tempIntegrationObject } = this.state

    let access_token

    if (tempIntegrationObject?.value?.googleCredentials) {
      access_token = tempIntegrationObject.value.googleCredentials.access_token
      this.showPicker(access_token)
      return
    } else {
      access_token = this.props.integrationValue.googleCredentials.access_token
    }

    let validToken = await this.checkTokenValidity(access_token)

    if (validToken) {
      this.showPicker(access_token)
    } else {
      tokenClient.requestAccessToken({ prompt: '' })
    }
  }

  handlePickDriveFolder(data) {
    if (data.action === 'picked') {
      const { id, name } = data.docs[0]
      const { tempIntegrationObject } = this.state
      tempIntegrationObject.targetFolder = { name, id }
      this.setState({
        tempIntegrationObject,
        newFolderCreation: false
      })
    }
  }

  gisLoaded() {
    const google = window.google

    let tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: global.env.FE_GOOGLE_CREDENTIALS_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: async (response) => {
        if (response.error !== undefined) {
          throw response
        }
        let { access_token } = response
        this.showPicker(access_token)
      }
    })

    this.setState({ tokenClient })
  }

  handleGoogleAuth(data) {
    const { base64Token } = data

    const decodedBase64 = JSON.parse(atob(base64Token))

    const tempIntegrationObject = {
      type: GoogleDrive.metaData.name,
      active: true,
      value: { googleCredentials: decodedBase64 },
      targetFolder: { name: this.props.form.title, id: '' },
      submissionIdentifier: '{submissionDate}'
    }

    this.setState({
      tempIntegrationObject,
      authenticationPopupIsOpen: false,
      display: 'configuration'
    })
  }

  tokenMessageListener(event) {
    if (event.data?.type === 'googleAuthToken') {
      this.handleGoogleAuth(event.data)
    }
  }

  filterElementsWithInput() {
    const elements = this.props.form.props.elements
    const inputElements = []

    inputElements.push({
      label: 'Date and time of the submission.',
      placeholder: `{submissionDate}`
    })

    elements.forEach((elem) => {
      if (Elements[elem.type].metaData.group === 'inputElement') {
        const inputElement = {
          label: elem.label,
          id: elem.id,
          type: elem.type,
          placeholder: `{${elem.type}_${elem.id}}`
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
    this.props.updateDbFormIntegrations(GoogleDrive.metaData.name)
  }

  async handleStartAuthentication() {
    const { form } = this.props
    if (form.id === null) {
      await this.props.handleSaveClick()
    }

    let { success, data } = await api({
      resource: `/api/services/google/generateAuthURL`,
      body: {
        scope: ['https://www.googleapis.com/auth/drive.file']
      },
      method: 'post'
    })

    if (success) {
      window.open(data, 'Authenticate With Google', 'width=450,height=600')
      this.setState({
        authenticationPopupIsOpen: true
      })
    } else {
      this.setState({
        display: 'description'
      })
    }
  }

  async handleFinalizeAuthentication() {
    const { newFolderCreation, tempIntegrationObject } = this.state

    let token

    let integrationObject = _.cloneDeep(tempIntegrationObject)

    integrationObject.type = GoogleDrive.metaData.name

    if (integrationObject?.value?.googleCredentials) {
      token = integrationObject.value.googleCredentials
    } else {
      token = this.props.integrationValue.googleCredentials
    }

    if (newFolderCreation) {
      let { success, data } = await api({
        resource: `/api/integrations/googledrive/createFolder`,
        method: 'post',
        body: {
          token: token,
          targetFolder: integrationObject.targetFolder
        }
      })

      if (success) {
        integrationObject.targetFolder = data
      } else {
        return
      }
    }

    this.props.setIntegration(integrationObject)

    this.props.updateDbFormIntegrations(GoogleDrive.metaData.name)

    this.setState({
      display: 'active'
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
      type: GoogleDrive.metaData.name,
      paused: true
    })
    this.props.updateDbFormIntegrations(GoogleDrive.metaData.name)
  }

  async handleResumeClick() {
    this.setState({
      tempIntegrationObject: {
        ...this.state.tempIntegrationObject,
        paused: false
      }
    })

    this.props.setIntegration({
      type: GoogleDrive.metaData.name,
      paused: false
    })

    this.props.updateDbFormIntegrations(GoogleDrive.metaData.name)
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
      paused: false,
      value: {},
      submissionIdentifier: ''
    })
    this.setState({
      display: 'description',
      isModalOpen: false
    })
    this.props.updateDbFormIntegrations(GoogleDrive.metaData.name)
  }

  handleEditClick() {
    this.setState({
      display: 'configuration',
      newFolderCreation: false
    })
  }

  handleFolderNameChange(elem, e) {
    const { tempIntegrationObject } = this.state

    tempIntegrationObject.targetFolder = { name: e.target.value, id: '' }

    this.setState({ tempIntegrationObject, newFolderCreation: true })
  }

  handleSubmissionIdentifierChange(elem, e) {
    const string = e.target.value
    const { tempIntegrationObject } = this.state
    tempIntegrationObject.submissionIdentifier = string

    this.setState({ tempIntegrationObject })
  }

  handleCopyClick(domElemId, copyText) {
    const sb = document.getElementById(`sit-${domElemId}`)

    sb.classList.add('show')

    navigator.clipboard.writeText(copyText)

    setTimeout(() => {
      sb.classList.remove('show')
    }, 1000)
  }

  render() {
    let display
    let { targetFolder, submissionIdentifier } =
      this.state.tempIntegrationObject

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
            You have successfully integrated your form to{' '}
            {GoogleDrive.metaData.displayText}! Submissions will be uploaded to
            the folder below. <br />
            <a
              href={
                'https://drive.google.com/drive/folders/' +
                this.props.integrationObject.targetFolder.id
              }
              target="_blank"
              rel="noopener noreferrer">
              https://drive.google.com/drive/folders/
              {this.props.integrationObject.targetFolder.id}
            </a>
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
            {this.state.authenticationPopupIsOpen ? (
              <button className="popup-open" type="button" disabled={true}>
                <DotLoader color={'#9ee048'} loading={true} size={12} />
              </button>
            ) : (
              <button
                className={
                  this.props.activeStatus
                    ? 'active-authentication'
                    : 'start-authentication'
                }
                type="button"
                onClick={this.handleStartAuthentication}>
                Authenticate with Google
              </button>
            )}
          </div>
        </>
      )
    } else if (this.state.display === 'configuration') {
      // CONFIGURATION
      display = (
        <>
          <div className="integration-configuration">
            <div className="integration-inputs">
              <div className="integration-input folderName">
                <span
                  className="new-folder-badge"
                  style={
                    this.state.newFolderCreation
                      ? { display: 'block' }
                      : { display: 'none' }
                  }>
                  NEW
                </span>
                <Renderer
                  className="folder"
                  theme="infernal"
                  handleFieldChange={this.handleFolderNameChange}
                  form={{
                    props: {
                      elements: [
                        {
                          id: 1,
                          type: 'TextBox',
                          label: 'Specify the target folder',
                          placeholder: 'Folder Name',
                          value: targetFolder.name
                        }
                      ]
                    }
                  }}
                />
                <button
                  className={'gDrive-pick-folder'}
                  onClick={() => this.createPicker()}>
                  <FontAwesomeIcon icon={faFolder} />
                </button>
              </div>
              <Renderer
                handleFieldChange={this.handleSubmissionIdentifierChange}
                className="file"
                theme="infernal"
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'TextBox',
                        placeholder: 'Please select a question',
                        label: 'Specify a target file name',
                        value: submissionIdentifier
                      }
                    ]
                  }
                }}
              />
              <div className="string-vars-container">
                <div className="string-vars-label">Available substitutions</div>
                <div className="string-vars">
                  {this.state.inputElements.map((e, index) => {
                    return (
                      <div
                        onClick={() =>
                          this.handleCopyClick(index, e.placeholder)
                        }
                        key={index}
                        className="submission-identifier-tag popover-container"
                        title={e.label}>
                        {e.placeholder}
                        <span id={`sit-${index}`} className="copied">
                          Copied to clipboard!
                        </span>
                        <div className="popoverText">{e.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="file-name-preview">
              <div className="message">Your submissions will be saved as:</div>
              <div className="value">
                <span>
                  <FontAwesomeIcon icon={faGoogleDrive} />
                </span>
                <FontAwesomeIcon icon={faChevronRight} />
                <span className="chosen-label">
                  {targetFolder ? targetFolder.name : ''}
                </span>
                <FontAwesomeIcon icon={faChevronRight} />
                <span className="chosen-label">
                  {submissionIdentifier || ''}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="complete-authentication"
            onClick={() => this.handleFinalizeAuthentication()}>
            Complete Authentication
          </button>
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
