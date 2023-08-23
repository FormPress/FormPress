import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faMapLocation, faWarning } from '@fortawesome/free-solid-svg-icons'

import './Location.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default class Location extends Component {
  constructor(props) {
    super(props)

    this.promptOnError = this.promptOnError.bind(this)
    this.promptOnSuccess = this.promptOnSuccess.bind(this)

    this.state = {
      errorMessage: '',
      inputValues: {
        latitude: '',
        longitude: ''
      }
    }
  }

  static weight = 14

  static defaultConfig = {
    id: 0,
    type: 'Location',
    label: 'Location'
  }

  static metaData = {
    icon: faMapLocation,
    displayText: 'Location',
    group: 'inputElement'
  }

  static configurableSettings = {
    hideManualInputs: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Hide coordinate input fields']
      }
    }
  }

  static submissionHandler = {
    findQuestionValue: (inputs, qid) => {
      let valueObject = {}
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          valueObject[elem.sub_id] = elem.value
        }
      }
      return valueObject
    }
  }

  static helpers = {
    getElementValue: (id) => {
      console.log('called getElementValue', id)
      const locationElem = document.getElementById(`qc_${id}`)
      const locationInputs = locationElem.querySelectorAll('input[type="text"]')

      const values = []

      for (const input of locationInputs) {
        values.push({
          type: input.dataset.coordinatetype,
          value: input.value
        })
      }

      return values
    },
    isFilled: (values) => {
      console.log('called isFilled', values)
      let filled = 0
      for (const value of values) {
        if (value.value !== '') {
          filled++
        }
      }
      return filled === 2
    }
  }

  static getPlainStringValue(entry) {
    let plainString
    if (entry.value !== '') {
      plainString = Object.entries(entry.value)
        .map(([, t]) => `${t}`)
        .join(' ')
    } else {
      plainString = '-'
    }
    return plainString
  }

  static renderDataValue(entry, question) {
    const apiKey =
      process.env.FE_GOOGLE_MAPS_KEY || global.env.FE_GOOGLE_MAPS_KEY

    const htmlCollection = []

    let invalidCoordinates = false

    Object.entries(entry.value).map((entry) => {
      const key = entry[0]
      const value = entry[1]

      if (value === '') {
        invalidCoordinates = true
      }

      let defaultSublabel = true

      if (question[`${key}SublabelText`]) {
        defaultSublabel = false
      }

      htmlCollection.push(
        <div key={key}>
          <strong
            style={defaultSublabel ? { textTransform: 'capitalize' } : null}>
            {defaultSublabel ? key : question[`${key}SublabelText`]}:
          </strong>
          &nbsp; {value}
          <br />
        </div>
      )
    })

    // means both latitude and longitude are present
    if (invalidCoordinates === false) {
      const { latitude, longitude } = entry.value

      htmlCollection.push(
        <div key="map">
          <strong>Map:</strong>
          &nbsp;
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${entry.value.latitude},${entry.value.longitude}`}
            target="_blank"
            rel="noopener noreferrer">
            Open in Google Maps
          </a>
          <br />
          <iframe
            title="map"
            style={{
              width: '650px',
              height: '350px',
              border: 'none'
            }}
            src={`https://www.google.com/maps/embed/v1/place?q=${latitude},${longitude}&key=${apiKey}`}></iframe>
        </div>
      )
    }

    return htmlCollection || '-'
  }

  promptOnSuccess(position) {
    // update state
    this.setState({
      errorMessage: '',
      inputValues: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      }
    })
  }

  promptOnError(error) {
    let { errorMessage } = this.state

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'User denied the request for Geolocation.'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.'
        break
      case error.TIMEOUT:
        errorMessage = 'The request to get user location timed out.'
        break
      case error.UNKNOWN_ERROR:
        errorMessage = 'An unknown error occurred.'
        break
    }

    this.setState({ errorMessage })
  }

  render() {
    const { config, mode } = this.props
    const { inputValues, errorMessage } = this.state
    const apiKey =
      process.env.FE_GOOGLE_MAPS_KEY ||
      (global.env ? global.env.FE_GOOGLE_MAPS_KEY : undefined)

    const errorPresent = errorMessage !== ''

    return (
      <ElementContainer type={config.type} {...this.props}>
        <>
          <div className="elemLabelTitle">
            <EditableLabel
              className="fl label"
              mode={mode}
              labelKey={config.id}
              handleLabelChange={this.props.handleLabelChange}
              dataPlaceholder="Type a question"
              value={config.label}
              required={config.required}
            />
          </div>
          <button
            type="button"
            className="latlong-button"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  // success callback
                  (position) => {
                    this.promptOnSuccess(position, inputValues)
                  },
                  // error callback
                  (error) => {
                    this.promptOnError(error, inputValues)
                  }
                )
              } else {
                this.setState({
                  errorMessage: 'Geolocation is not supported by this browser.'
                })
              }
            }}>
            Fill In Current Location
          </button>
          <iframe
            title="map"
            style={{
              width: '500px',
              height: '250px',
              border: 'none'
            }}
            className="dn"
            data-apiKey={apiKey}
            src=""></iframe>
          <div className={'response-status' + (errorPresent ? '' : ' dn')}>
            <FontAwesomeIcon icon={faWarning} className="warning-icon" />
            &nbsp;{errorMessage}
          </div>
          <div className="input">
            <div
              className={
                'latlong-fields' + (config.hideManualInputs ? ' dn' : '')
              }>
              <div>
                <EditableLabel
                  className="sublabel latlong-label"
                  dataPlaceholder="Click to edit sublabel"
                  mode={mode}
                  labelKey={`location_${config.id}_latitude`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={
                    typeof config.latitudeSublabelText !== 'undefined'
                      ? config.latitudeSublabelText
                      : 'Latitude'
                  }
                />
                <input
                  type="text"
                  className="latlong-input"
                  readOnly={true}
                  data-coordinateType="latitude"
                  name={`q_${config.id}[latitude]`}
                  value={inputValues.latitude}
                />
              </div>
              <div>
                <EditableLabel
                  className="sublabel latlong-label"
                  dataPlaceholder="Click to edit sublabel"
                  mode={mode}
                  labelKey={`location_${config.id}_longitude`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={
                    typeof config.longitudeSublabelText !== 'undefined'
                      ? config.longitudeSublabelText
                      : 'Longitude'
                  }
                />
                <input
                  type="text"
                  className="latlong-input"
                  readOnly={true}
                  data-coordinateType="longitude"
                  name={`q_${config.id}[longitude]`}
                  value={inputValues.longitude}
                />
              </div>
            </div>
          </div>
          <div className="clearfix">
            <EditableLabel
              className="sublabel location-sublabel"
              dataPlaceholder="Click to edit sublabel"
              mode={mode}
              labelKey={`sub_${config.id}`}
              handleLabelChange={this.props.handleLabelChange}
              value={
                typeof config.sublabelText !== 'undefined' &&
                config.sublabelText !== ''
                  ? config.sublabelText
                  : ''
              }
            />
          </div>
        </>
      </ElementContainer>
    )
  }
}
