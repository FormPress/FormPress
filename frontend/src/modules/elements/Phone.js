import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './Phone.css'

const BACKEND = process.env.REACT_APP_BACKEND

export default class Phone extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datasets: {}
    }
  }

  componentDidMount() {
    fetch(`${BACKEND}/api/datasets?dataset=countriesDialCodes`)
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        this.setState({
          datasets: response
        })
      })
  }
  static weight = 13

  static defaultConfig = {
    id: 0,
    type: 'Phone',
    label: 'Phone',
    hasDataset: true
  }

  static renderDataValue(entry) {
    return entry.value
  }

  static helpers = {
    getElementValue: 'defaultInputHelpers',
    isFilled: (value) => {
      return value.trim().length > 6
    }
  }

  static configurableSettings = {
    defaultDialCode: {
      default: '+1 (US)',
      formProps: {
        type: 'Dropdown',
        label: 'Default country',
        hasDataset: true,
        dataset: 'countriesDialCodes'
      }
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}
    const { datasets } = this.state

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    if (typeof config.placeholder !== 'undefined') {
      inputProps.placeholder = config.placeholder
    }

    if (typeof config.maxLength !== 'undefined') {
      inputProps.maxLength = config.maxLength
    }

    let display

    display = [
      <EditableLabel
        className="fl label"
        dataPlaceholder="Type a question"
        mode={mode}
        labelKey={config.id}
        handleLabelChange={this.props.handleLabelChange}
        value={config.label}
        required={config.required}
        key="1"
      />,
      <div className="fl input" key="2">
        <select
          className="dialCode"
          id={`phone-dialCode_${config.id}`}
          value={config.defaultDialCode ? config.defaultDialCode : '+1 (US)'}
          data-fp-list={'countriesDialCodes'}
          data-fp-defaultvalue={config.defaultDialCode}
          disabled={mode !== 'renderer'}>
          {datasets && datasets.countriesDialCodes
            ? datasets.countriesDialCodes.map((country, index) => {
                return (
                  <option key={index} value={country.value}>
                    {country.display}
                  </option>
                )
              })
            : null}
        </select>
        <input
          id={`q_${config.id}`}
          className="phoneInput"
          name={`q_${config.id}`}
          maxLength={30}
          value={
            config.defaultDialCode
              ? config.defaultDialCode.substring(
                  0,
                  config.defaultDialCode.length - 4
                )
              : // to remove the part with the country code
                ''
          }
          readOnly={mode === 'builder'}
          {...inputProps}
        />
      </div>,
      <div className="clearfix" key="3">
        <EditableLabel
          className="sublabel"
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
      </div>,
      <div className="fl metadata" key="4">
        <div className="requiredErrorText">{config.requiredText}</div>
      </div>
    ]

    if (mode !== 'builder') {
      let scriptInnerHtml = `
      document.getElementById('phone-dialCode_${config.id}').addEventListener('change', function () {
        var dialCode = this.value
        dialCode = dialCode.substring(0, dialCode.length - 4)
        var phoneNumberInput = this.nextElementSibling
        phoneNumberInput.value = dialCode
      })
    
      document.getElementById('q_${config.id}').addEventListener('keypress', function (e) {
        var key = e.which || e.keyCode
        var regex = /^[0-9 ()+-]+$/
        if (!regex.test(String.fromCharCode(key))) {
          e.preventDefault()
        }
      })
  `
      let script = (
        <script key={2} dangerouslySetInnerHTML={{ __html: scriptInnerHtml }} />
      )
      display.push(script)
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
