import React, { Component } from 'react'
import Renderer from '../Renderer'
import Modal from '../common/Modal'
import './GoogleSheets.css'
import { api } from '../../helper'
import * as Elements from '../elements'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolder } from '@fortawesome/free-solid-svg-icons'
import _ from 'lodash'
import { DotLoader } from 'react-spinner-overlay'
import { FPLoader } from '../../svg'

const { REACT_APP_GOOGLE_CREDENTIALS_CLIENT_ID } = process.env

export default class GoogleSheets extends Component {
  static metaData = {
    icon:
      'https://upload.wikimedia.org/wikipedia/commons/a/ae/Google_Sheets_2020_Logo.svg',
    displayText: 'Google Sheets',
    name: 'GoogleSheets'
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
      newSpreadsheetCreation: true,
      loading: false,
      advancedConfig: {},
      advancedConfigEnabled: false,
      selectedSpreadsheet: {
        chosenSheet: 'newSheet',
        mappings: []
      }
    }

    this.handleStartAuthentication = this.handleStartAuthentication.bind(this)
    this.handleActivateClick = this.handleActivateClick.bind(this)
    this.handlePauseClick = this.handlePauseClick.bind(this)
    this.handleResumeClick = this.handleResumeClick.bind(this)
    this.handleRemoveClick = this.handleRemoveClick.bind(this)
    this.handleEditClick = this.handleEditClick.bind(this)
    this.handleCloseModalClick = this.handleCloseModalClick.bind(this)
    this.removeIntegration = this.removeIntegration.bind(this)
    this.handleSheetNameChange = this.handleSheetNameChange.bind(this)
    this.handleSpreadsheetNameChange = this.handleSpreadsheetNameChange.bind(
      this
    )
    this.filterElementsWithInput = this.filterElementsWithInput.bind(this)
    this.createPicker = this.createPicker.bind(this)
    this.gisLoaded = this.gisLoaded.bind(this)
    this.handlePickDriveSheet = this.handlePickDriveSheet.bind(this)
    this.showPicker = this.showPicker.bind(this)
    this.checkTokenValidity = this.checkTokenValidity.bind(this)
    this.handleGoogleAuth = this.handleGoogleAuth.bind(this)
    this.tokenMessageListener = this.tokenMessageListener.bind(this)
    this.handleChooseInputElements = this.handleChooseInputElements.bind(this)
    this.handleAdvancedConfigEnabledChange = this.handleAdvancedConfigEnabledChange.bind(
      this
    )
    this.handleSheetSelectorChange = this.handleSheetSelectorChange.bind(this)
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

  async componentDidUpdate(prevProps) {
    if (this.props.activeStatus !== prevProps.activeStatus) {
      await this.props.handlePublishClick()
    }
  }

  showPicker(access_token) {
    const google = window.google

    const docsView = new google.picker.DocsView()
      .setMode(google.picker.DocsViewMode.LIST)
      .setParent('root')
      .setIncludeFolders(true)

    const picker = new google.picker.PickerBuilder()
      .addView(docsView)
      .enableFeature(google.picker.Feature.MINE_ONLY)
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .setSelectableMimeTypes('application/vnd.google-apps.spreadsheet')
      .setOAuthToken(access_token)
      .setCallback(this.handlePickDriveSheet)
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

  async handlePickDriveSheet(data) {
    if (data.action === 'picked') {
      const { id, name } = data.docs[0]
      const { tempIntegrationObject, selectedSpreadsheet } = this.state
      tempIntegrationObject.targetSpreadsheet.title = name
      tempIntegrationObject.targetSpreadsheet.id = id

      const mappingRequest = await api({
        resource: '/api/googlesheets/getmapping',
        method: 'POST',
        body: {
          token: tempIntegrationObject.value.googleCredentials,
          spreadsheetId: id
        }
      })

      const mappings = mappingRequest.data

      selectedSpreadsheet.mappings = mappings

      this.setState({
        tempIntegrationObject,
        newSpreadsheetCreation: false,
        selectedSpreadsheet
      })
    }
  }

  gisLoaded() {
    const google = window.google

    let tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: REACT_APP_GOOGLE_CREDENTIALS_CLIENT_ID,
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
      type: GoogleSheets.metaData.name,
      active: true,
      value: { googleCredentials: decodedBase64 },
      targetSpreadsheet: {
        title: this.props.form.title,
        id: '',
        sheet: { title: '' }
      }
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
    const all = []
    const chosen = []

    elements
      .filter((e) => {
        return Elements[e.type].metaData.group === 'inputElement'
      })
      .forEach((elem, index) => {
        const inputElement = {
          label: elem.label,
          id: elem.id,
          type: elem.type,
          placeholder: `{${elem.type}_${elem.id}}`
        }
        all.push(inputElement)
        chosen.push(index)
      })
    this.setState({ inputElements: { all, chosen } })
  }

  async handleActivateClick() {
    if (this.props.integrationValue) {
      this.props.setIntegration({
        type: GoogleSheets.metaData.name,
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

  async handleStartAuthentication() {
    await this.props.handlePublishClick()
    let { success, data } = await api({
      resource: `/api/services/google/generateAuthURL`,
      body: {
        scope: [
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file'
        ]
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
    this.setState({ loading: true })

    const {
      newSpreadsheetCreation,
      tempIntegrationObject,
      selectedSpreadsheet
    } = this.state

    let newSheetCreation = selectedSpreadsheet.chosenSheet === 'newSheet'

    let token

    let integrationObject = _.cloneDeep(tempIntegrationObject)

    let fieldMapping

    if (this.state.advancedConfigEnabled) {
      const referenceRowInputsHTMLNodes = document.querySelectorAll(
        '.advanced-config-reference'
      )
      const referenceRowInputs = Array.from(referenceRowInputsHTMLNodes).map(
        (v) => v.value || ''
      )
      const valuesRowInputsHTMLNodes = document.querySelectorAll(
        '.advanced-config-values'
      )
      const valuesRowInputs = Array.from(valuesRowInputsHTMLNodes).map(
        (v) => v.value || ''
      )

      const valuesRowElements = valuesRowInputs.map((v) => {
        if (v === 'submissionDate') {
          return v
        }

        return this.state.inputElements.all.find((e) => e.label === v) || ''
      })

      fieldMapping = {
        advancedConfigEnabled: true,
        referenceRow: referenceRowInputs,
        valuesRow: valuesRowElements
      }
    } else {
      fieldMapping = {
        valuesRow: this.state.inputElements.chosen.map((elem, index) => {
          return this.state.inputElements.all[index]
        })
      }
    }

    integrationObject.fieldMapping = fieldMapping
    integrationObject.type = GoogleSheets.metaData.name

    if (integrationObject?.value?.googleCredentials) {
      token = integrationObject.value.googleCredentials
    } else {
      token = this.props.integrationValue.googleCredentials
    }

    if (newSpreadsheetCreation === true || newSheetCreation === true) {
      let { success, data } = await api({
        resource: `/api/googlesheets/init`,
        method: 'post',
        body: {
          token: token,
          targetSpreadsheet: integrationObject.targetSpreadsheet,
          fieldMapping: integrationObject.fieldMapping
        }
      })

      if (success === true) {
        integrationObject.targetSpreadsheet = data.targetSpreadsheet
      }

      if (!success) {
        this.setState({ loading: false })
        return
      }
    }

    await this.props.setIntegration(integrationObject)

    await this.props.handlePublishClick()

    this.setState({
      tempIntegrationObject: integrationObject,
      display: 'active',
      loading: false
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
      type: GoogleSheets.metaData.name,
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
      type: GoogleSheets.metaData.name,
      paused: false
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
        You will not be able to receive submission data to the same spreadsheet
        again. Are you sure to proceed?
      </div>
    )

    this.setState({ modalContent, isModalOpen: true })
  }

  async removeIntegration() {
    this.props.setIntegration({
      type: GoogleSheets.metaData.name,
      active: false,
      paused: false,
      value: {},
      submissionIdentifier: ''
    })
    this.setState({
      display: 'description'
    })
    this.setState({ isModalOpen: false })
  }

  async handleEditClick() {
    const { tempIntegrationObject, selectedSpreadsheet } = this.state
    const spreadsheetId = tempIntegrationObject.targetSpreadsheet.id
    const { targetSpreadsheet } = tempIntegrationObject

    const { fieldMapping } = tempIntegrationObject

    this.setState({
      display: 'configuration',
      loading: true
    })

    const mappingRequest = await api({
      resource: '/api/googlesheets/getmapping',
      method: 'POST',
      body: {
        token: tempIntegrationObject.value.googleCredentials,
        spreadsheetId
      }
    })

    const mappings = mappingRequest.data.map((e) => {
      return { ...e, display: e.title, value: e.title }
    })

    selectedSpreadsheet.mappings = mappings
    selectedSpreadsheet.chosenSheet = targetSpreadsheet.sheet.title

    this.setState({
      advancedConfigEnabled: fieldMapping.advancedConfigEnabled,
      selectedSpreadsheet,
      newSpreadsheetCreation: false,
      loading: false
    })
  }

  handleSpreadsheetNameChange(elem, e) {
    const { tempIntegrationObject, selectedSpreadsheet } = this.state

    tempIntegrationObject.targetSpreadsheet = {
      ...tempIntegrationObject.targetSpreadsheet,
      title: e.target.value,
      id: ''
    }

    selectedSpreadsheet.chosenSheet = 'newSheet'
    selectedSpreadsheet.mappings = []

    this.setState({ tempIntegrationObject, newSpreadsheetCreation: true })
  }

  handleSheetNameChange(elem, e) {
    const string = e.target.value
    const { tempIntegrationObject } = this.state

    const sheet = { title: string }

    tempIntegrationObject.targetSpreadsheet.sheet = sheet

    this.setState({ tempIntegrationObject })
  }

  handleChooseInputElements(e, elem) {
    const { inputElements } = this.state

    if (e.id === 1) {
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

    this.setState({ inputElements })
  }

  handleAdvancedConfigEnabledChange() {
    this.setState({
      advancedConfigEnabled: !this.state.advancedConfigEnabled
    })
  }

  handleSheetSelectorChange(e, elem) {
    const { tempIntegrationObject, selectedSpreadsheet } = this.state

    if (elem.target.value === 'newSheet') {
      tempIntegrationObject.targetSpreadsheet.sheet.title = ''
    } else {
      tempIntegrationObject.targetSpreadsheet.sheet.title = elem.target.value
    }

    selectedSpreadsheet.chosenSheet = elem.target.value

    this.setState({ selectedSpreadsheet, tempIntegrationObject })
  }

  render() {
    const { tempIntegrationObject } = this.state

    let display

    const { selectedSpreadsheet } = this.state
    let { targetSpreadsheet } = this.state.tempIntegrationObject

    const spreadsheetSelectorOptions = [
      ...this.state.selectedSpreadsheet.mappings,
      {
        display: 'Create new sheet',
        value: 'newSheet'
      }
    ]

    let paused
    if (tempIntegrationObject?.paused !== undefined) {
      paused = tempIntegrationObject.paused
    } else {
      paused = tempIntegrationObject.paused
    }

    const { inputElements, advancedConfigEnabled } = this.state

    let advancedConfigElements
    if (advancedConfigEnabled) {
      advancedConfigElements = inputElements.all.map((elem, index) => {
        if (!inputElements.chosen.includes(index)) {
          return elem.label
        }
      })

      advancedConfigElements.unshift('Choose element value')
    }

    if (this.state.loading === true) {
      return (
        <div className="integration-wrapper col-10-16">
          <div className="integration-loader-container">
            <FPLoader />
          </div>
        </div>
      )
    }

    if (
      paused ||
      (this.props.activeStatus && this.state.display === 'active')
    ) {
      display = (
        <>
          <div className="integration-active">
            You have successfully integrated your form to{' '}
            {GoogleSheets.metaData.displayText}! Submissions will be added to
            the spreadsheet below. <br />
            <a
              href={
                'https://docs.google.com/spreadsheets/d/' +
                this.props.integrationObject.targetSpreadsheet.id
              }
              target="_blank"
              rel="noopener noreferrer">
              {'https://docs.google.com/spreadsheets/d/' +
                this.props.integrationObject.targetSpreadsheet.id}
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
            Have your submission data stored in a spreadsheet!
          </div>
          <div className="integration-text">
            You can create a unique spreadsheet for each form, name it the way
            you like, and have your submissions added to a spreadsheet of your
            choosing! Google Sheets stores your data and makes it possible for
            you to reach them anywhere! Plus, it’s now super easy to collect all
            your data in one place!
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
          <Renderer
            className="advanced-configuration-toggle"
            theme="gleam"
            handleFieldChange={this.handleAdvancedConfigEnabledChange}
            form={{
              props: {
                elements: [
                  {
                    id: 1,
                    type: 'Checkbox',
                    options: ['Advanced Configuration'],
                    toggle: true,
                    value: this.state.advancedConfigEnabled
                  }
                ]
              }
            }}
          />
          <div className="integration-configuration">
            <div className="integration-inputs">
              <div className="integration-input folderName">
                <span
                  className="new-folder-badge"
                  style={
                    this.state.newSpreadsheetCreation
                      ? { display: 'block' }
                      : { display: 'none' }
                  }>
                  NEW
                </span>
                <Renderer
                  className="folder cannot-be-empty"
                  theme="infernal"
                  handleFieldChange={this.handleSpreadsheetNameChange}
                  form={{
                    props: {
                      elements: [
                        {
                          id: 1,
                          type: 'TextBox',
                          label: 'Specify the target spreadsheet',
                          placeholder: 'Spreadsheet Name',
                          value: targetSpreadsheet.title
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
                handleFieldChange={this.handleSheetSelectorChange}
                className="file"
                theme="infernal"
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'Dropdown',
                        placeholder: 'Choose a sheet',
                        label: 'Choose a sheet',
                        options: spreadsheetSelectorOptions,
                        value: this.state.selectedSpreadsheet.chosenSheet
                      }
                    ]
                  }
                }}
              />
              <Renderer
                handleFieldChange={this.handleSheetNameChange}
                className={
                  'file cannot-be-empty' +
                  (this.state.selectedSpreadsheet.chosenSheet === 'newSheet'
                    ? ''
                    : ' dn')
                }
                theme="infernal"
                form={{
                  props: {
                    elements: [
                      {
                        id: 1,
                        type: 'TextBox',
                        placeholder: 'Please enter a sheet name',
                        label: 'Specify a sheet name',
                        value: targetSpreadsheet.sheet.title
                      }
                    ]
                  }
                }}
              />
              {!this.state.advancedConfigEnabled ? (
                <div className="string-vars-container">
                  <div className="string-vars-label">Choose elements</div>
                  <Renderer
                    handleFieldChange={this.handleChooseInputElements}
                    theme="infernal"
                    allowInternal={true}
                    className={'input-elems'}
                    form={{
                      props: {
                        elements: [
                          {
                            id: 1,
                            type: 'Checkbox',
                            options: ['Select All'],
                            value:
                              inputElements.chosen.length ===
                              inputElements.all.length
                          },
                          {
                            id: 2,
                            type: 'Checkbox',
                            options: this.state.inputElements.all.map(
                              (elem) => {
                                return elem.label
                              }
                            ),
                            value: this.state.inputElements.chosen
                          }
                        ]
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="spreadsheet-preview">
                  <span className="advanced-mapping-label">
                    Advanced mapping
                  </span>
                  <div className="advanced-settings">
                    <div
                      className="table-wrapper"
                      onWheel={(e) => {
                        const thisElem = e.currentTarget
                        if (e.deltaY == 0) return
                        e.preventDefault()
                        thisElem.scrollTo({
                          left: thisElem.scrollLeft + e.deltaY
                          // behavior: 'smooth'
                        })
                      }}>
                      <table>
                        <thead>
                          <tr className="table-head-row">
                            <th className="legendCell"></th>
                            <th>A</th>
                            <th>B</th>
                            <th>C</th>
                            <th>D</th>
                            <th>E</th>
                            <th>F</th>
                            <th>G</th>
                            <th>H</th>
                            <th>I</th>
                            <th>J</th>
                            <th>K</th>
                            <th>L</th>
                            <th>M</th>
                            <th>N</th>
                            <th>O</th>
                            <th>P</th>
                            <th>Q</th>
                            <th>R</th>
                            <th>S</th>
                            <th>T</th>
                            <th>U</th>
                            <th>V</th>
                            <th>W</th>
                            <th>X</th>
                            <th>Y</th>
                            <th>Z</th>
                          </tr>
                          <tr className="table-reference-row">
                            <th className="legendCell">REFERENCE</th>
                            {selectedSpreadsheet.chosenSheet === 'newSheet'
                              ? this.state.inputElements.all.map(
                                  (elem, index) => {
                                    return (
                                      <th key={index}>
                                        <input
                                          type="text"
                                          className="advanced-config-reference"></input>
                                      </th>
                                    )
                                  }
                                )
                              : selectedSpreadsheet.mappings
                                  .find(
                                    (mapping) =>
                                      mapping.title ===
                                      selectedSpreadsheet.chosenSheet
                                  )
                                  ?.fields.map((mapping, index) => {
                                    return <th key={index}>{mapping}</th>
                                  })}
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="table-values-row">
                            <td className="legendCell">VALUE</td>
                            {this.state.inputElements.all.map((elem, index) => {
                              return (
                                <td>
                                  <select
                                    className="advanced-config-values"
                                    defaultValue={''}>
                                    <option value="">Choose a value</option>
                                    <option value="none">None</option>

                                    <optgroup label="Elements">
                                      {this.state.inputElements.all.map(
                                        (elem, index) => {
                                          return (
                                            <option key={index}>
                                              {elem.label}
                                            </option>
                                          )
                                        }
                                      )}
                                    </optgroup>
                                    <optgroup label="Meta data">
                                      <option value={'submissionDate'}>
                                        Submission Date
                                      </option>
                                    </optgroup>
                                  </select>
                                </td>
                              )
                            })}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
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
            src={GoogleSheets.metaData.icon}
            className="logo"
            alt="google-drive-logo"
          />
          <div className="title">{GoogleSheets.metaData.displayText}</div>
        </div>
        <div className="integration-content">{display}</div>
      </div>
    )
  }
}
