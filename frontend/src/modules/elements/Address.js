import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons'

import './Address.css'

export default class Address extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datasets: {}
    }
  }

  componentDidMount() {
    fetch(
      `${
        process.env.FE_BACKEND || global.env.FE_BACKEND
      }/api/datasets?dataset=countriesWithFlags,usStates`
    )
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        this.setState({
          datasets: response
        })
      })
  }

  static weight = 10

  static defaultConfig = {
    id: 0,
    city: true,
    countriesType: 'International',
    country: true,
    hasDataset: true,
    label: 'Address information',
    placeholder: 'Address information',
    state: true,
    street: true,
    street2: true,
    title: false,
    type: 'Address',
    zip: true
  }

  static metaData = {
    icon: faMapMarkerAlt,
    displayText: 'Address',
    group: 'inputElement'
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

  static configurableSettings = {
    countriesType: {
      default: 'International',
      formProps: {
        type: 'Radio',
        options: ['International', 'US'],
        label: 'Country type'
      }
    },
    defaultCountry: {
      default: 'United States',
      isVisible: (config) => {
        return config.countriesType === 'International'
      },
      formProps: {
        type: 'Dropdown',
        label: 'Default country',
        hasDataset: true,
        dataset: 'countriesWithFlags'
      }
    },
    title: {
      default: false,
      formProps: {
        type: 'Header',
        sublabel: 'Show / hide fields'
      }
    },
    street: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Street Line']
      }
    },
    street2: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Street Line 2']
      }
    },

    city: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['City']
      }
    },
    zip: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Zip']
      }
    },
    state: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['State'],
        value: true
      }
    },
    country: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Country']
      }
    }
  }

  static helpers = {
    getElementValue: (id) => {
      const addressElem = document.getElementById(`qc_${id}`)
      const addressInputs = addressElem.querySelectorAll('input[type="text"]')
      const addressSelects = addressElem.querySelectorAll('select')

      const values = []

      for (const input of addressInputs) {
        values.push({
          type: input.dataset.addresstype,
          value: input.value
        })
      }

      for (const select of addressSelects) {
        values.push({
          type: select.dataset.addresstype,
          value: select.value
        })
      }

      return values
    },
    isFilled: (values) => {
      let filled = 0
      for (const value of values) {
        if (value.value !== '') {
          filled++
        }
      }
      return filled >= 2
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
    const htmlCollection = []
    Object.entries(entry.value).forEach((entry) => {
      const key = entry[0]
      const value = entry[1]

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

    // means we hava a queriable address
    if (htmlCollection.length > 0) {
      const query = this.getPlainStringValue(entry)

      htmlCollection.push(
        <div key="map">
          <strong>Map:</strong>
          &nbsp;
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${query}`}
            target="_blank"
            rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </div>
      )
    }

    return htmlCollection || '-'
  }

  render() {
    const { config, mode } = this.props
    const { datasets } = this.state

    return (
      <ElementContainer type={config.type} {...this.props}>
        <div className="elemLabelTitle" key={0}>
          <EditableLabel
            className="fl label"
            mode={mode}
            labelKey={config.id}
            dataPlaceholder="Type a question"
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            required={config.required}
          />
        </div>

        <div className="input">
          {config.street ? (
            <span className={`address-section adr-street`}>
              <input
                id={`address-street_${config.id}`}
                data-addressType="street"
                name={`q_${config.id}[street]`}
                type="text"
              />
              <div className="clearfix">
                <EditableLabel
                  className="sublabel"
                  dataPlaceholder="Click to edit sublabel"
                  mode={mode}
                  labelKey={`address_${config.id}_street`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={
                    typeof config.streetSublabelText !== 'undefined'
                      ? config.streetSublabelText
                      : 'Street Line'
                  }
                />
              </div>
            </span>
          ) : null}

          {config.street2 ? (
            <span className={`address-section adr-street`}>
              <input
                id={`address-street2_${config.id}`}
                data-addressType="street2"
                name={`q_${config.id}[street2]`}
                type="text"
              />
              <div className="clearfix">
                <EditableLabel
                  className="sublabel"
                  dataPlaceholder="Click to edit sublabel"
                  mode={mode}
                  labelKey={`address_${config.id}_street2`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={
                    typeof config.street2SublabelText !== 'undefined'
                      ? config.street2SublabelText
                      : 'Street Line 2'
                  }
                />
              </div>
            </span>
          ) : null}

          <div className={`address-flex-row`}>
            {config.city ? (
              <span className={` address-section adr-city`}>
                <input
                  id={`address-city_${config.id}`}
                  data-addressType="city"
                  name={`q_${config.id}[city]`}
                  type="text"
                />
                <div className="clearfix">
                  <EditableLabel
                    className="sublabel"
                    dataPlaceholder="Click to edit sublabel"
                    mode={mode}
                    labelKey={`address_${config.id}_city`}
                    handleLabelChange={this.props.handleLabelChange}
                    value={
                      typeof config.citySublabelText !== 'undefined'
                        ? config.citySublabelText
                        : 'City'
                    }
                  />
                </div>
              </span>
            ) : null}

            {config.zip ? (
              <span className={`address-section adr-zip`}>
                <input
                  id={`address-zip_${config.id}`}
                  data-addressType="zip"
                  name={`q_${config.id}[zip]`}
                  type="text"
                />
                <div className="clearfix">
                  <EditableLabel
                    className="sublabel"
                    dataPlaceholder="Click to edit sublabel"
                    mode={mode}
                    labelKey={`address_${config.id}_zip`}
                    handleLabelChange={this.props.handleLabelChange}
                    value={
                      typeof config.zipSublabelText !== 'undefined'
                        ? config.zipSublabelText
                        : 'Zip'
                    }
                  />
                </div>
              </span>
            ) : null}

            {config.state ? (
              <span className={`address-section adr-state`}>
                {config.countriesType === 'US' ? (
                  <select
                    className="dropdown-select"
                    id={`address-state_${config.id}`}
                    data-addressType="state"
                    name={`q_${config.id}[state]`}
                    defaultValue={config.value ? config.value : ''}
                    data-fp-list={'usStates'}>
                    {datasets && datasets.usStates
                      ? datasets.usStates.map((state, index) => {
                          return (
                            <option key={index} value={state.value}>
                              {state.display}
                            </option>
                          )
                        })
                      : null}
                  </select>
                ) : (
                  <input
                    id={`address-state_${config.id}`}
                    data-addressType="state"
                    name={`q_${config.id}[state]`}
                    type="text"
                  />
                )}
                <div className="clearfix">
                  <EditableLabel
                    className="sublabel"
                    dataPlaceholder="Click to edit sublabel"
                    mode={mode}
                    labelKey={`address_${config.id}_state`}
                    handleLabelChange={this.props.handleLabelChange}
                    value={
                      typeof config.stateSublabelText !== 'undefined'
                        ? config.stateSublabelText
                        : 'State'
                    }
                  />
                </div>
              </span>
            ) : null}

            {config.country && config.countriesType === 'International' ? (
              <span className={`address-section adr-country`}>
                <select
                  className="dropdown-select"
                  id={`address-country_${config.id}`}
                  data-addressType="country"
                  name={`q_${config.id}[country]`}
                  data-fp-defaultvalue={config.defaultCountry}
                  value={
                    config.defaultCountry
                      ? config.defaultCountry
                      : 'United States'
                  }
                  readOnly={mode === 'builder'}
                  data-fp-list={'countriesWithFlags'}
                  disabled={mode !== 'renderer'}>
                  {datasets && datasets.countriesWithFlags
                    ? datasets.countriesWithFlags.map((country, index) => {
                        return (
                          <option key={index} value={country.value}>
                            {country.display}
                          </option>
                        )
                      })
                    : null}
                </select>

                <div className="clearfix">
                  <EditableLabel
                    className="sublabel"
                    dataPlaceholder="Click to edit sublabel"
                    mode={mode}
                    labelKey={`address_${config.id}_country`}
                    handleLabelChange={this.props.handleLabelChange}
                    value={
                      typeof config.countrySublabelText !== 'undefined'
                        ? config.countrySublabelText
                        : 'Country'
                    }
                  />
                </div>
              </span>
            ) : null}
          </div>
        </div>
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
