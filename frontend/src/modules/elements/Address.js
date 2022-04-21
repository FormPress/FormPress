import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './Address.css'

const BACKEND = process.env.REACT_APP_BACKEND

export default class Address extends Component {
  constructor(props) {
    super(props)
    this.state = {
      datasets: {}
    }
  }

  componentDidMount() {
    fetch(`${BACKEND}/api/datasets?dataset=countriesWithFlags,usStates`)
      .then((response) => {
        return response.json()
      })
      .then((response) => {
        this.setState({
          datasets: response
        })
      })
  }

  static weight = 8

  static defaultConfig = {
    id: 0,
    type: 'Address',
    label: 'Address information',
    hasDataset: true,
    placeholder: 'Address information'
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
        options: ['Street Line 1']
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
      const values = []
      addressInputs.forEach((input) => {
        values.push(input.value)
      })
      return values
    },
    isFilled: (values) => {
      return !values.every((item) => item === '')
    }
  }

  static renderDataValue(entry) {
    if (entry.value !== '') {
      return Object.entries(JSON.parse(entry.value))
        .map(([, t]) => `${t}`)
        .join(' ')
    } else {
      return '-'
    }
  }

  render() {
    const { config, mode } = this.props
    const { datasets } = this.state

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />

        {config.street ? (
          <span className={`address-section adr-street`}>
            <input
              id={`address-street_${config.id}`}
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
                name={`q_${config.id}[country]`}
                defaultValue={config.value ? config.value : ''}
                data-fp-list={'countriesWithFlags'}>
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
      </ElementContainer>
    )
  }
}
