import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { faSignal } from '@fortawesome/free-solid-svg-icons'

import './NetPromoterScore.css'

export default class NetPromoterScore extends Component {
  static weight = 6

  static defaultConfig = {
    id: 0,
    type: 'NetPromoterScore',
    label: 'Net Promoter Score',
    options: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
  }

  static metaData = {
    icon: faSignal,
    displayText: 'Net Promoter Score',
    group: 'inputElement'
  }

  static submissionHandler = {
    findQuestionValue: (inputs, qid) => {
      let value = ''
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          value = elem.value
        }
      }
      return value
    }
  }

  static getPlainStringValue(entry) {
    let plainString

    if (entry.value !== '') {
      plainString = entry.value
    } else {
      plainString = '-'
    }

    return plainString
  }

  static renderDataValue(entry, question) {
    return (
      <ul className="nps">
        {this.defaultConfig.options.map((item) => {
          return (
            <li key={item}>
              <input
                type="radio"
                id={`q_${question.id}_${item}`}
                name={`q_${question.id}`}
                value={item}
                className="nps-input"
                disabled="disabled"
                style={{ display: 'none !important' }}
                checked={`${entry.value}` === item}></input>
              <label
                className="net-promoter-score-label"
                htmlFor={`q_${question.id}_${item}`}>
                {item}
              </label>
            </li>
          )
        })}
      </ul>
    )
  }

  static helpers = {
    getElementValue: (id) => {
      const nodeList = document.getElementsByName(`q_${id}`)
      for (let i = 0; i < nodeList.length; i++) {
        if (nodeList[i].checked) {
          return nodeList[i].value
        }
      }
    },
    isFilled: (value) => {
      return value !== '' && value !== undefined
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    if (
      typeof config.customFieldId !== 'undefined' &&
      config.customFieldId !== ''
    ) {
      inputProps['data-fp-custom-field-id'] = 'q_' + config.customFieldId
    }

    var display = [
      <div className="elemLabelTitle" key={0}>
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
      </div>,
      <div key="2" className="fl input">
        <ul>
          {config.options.map((item, key) => {
            return (
              <li key={key}>
                <input
                  type="radio"
                  id={`q_${config.id}_${key}`}
                  name={`q_${config.id}`}
                  value={item}
                  defaultChecked={config.value === item}
                  {...inputProps}></input>
                <label
                  className="net-promoter-score-label"
                  htmlFor={`q_${config.id}_${key}`}>
                  {item}
                </label>
              </li>
            )
          })}
        </ul>
      </div>,
      <div className="clearfix scale-legend" key="3">
        <EditableLabel
          className="sublabel"
          dataPlaceholder="Click to edit sublabel"
          mode={mode}
          labelKey={`net_${config.id}_negative`}
          limit={20}
          handleLabelChange={this.props.handleLabelChange}
          value={
            typeof config.negativeSublabelText !== 'undefined' &&
            config.negativeSublabelText !== ''
              ? config.negativeSublabelText
              : 'Not Likely'
          }
        />

        <EditableLabel
          className="sublabel fr"
          dataPlaceholder="Click to edit sublabel"
          mode={mode}
          labelKey={`net_${config.id}_positive`}
          limit={20}
          handleLabelChange={this.props.handleLabelChange}
          value={
            typeof config.positiveSublabelText !== 'undefined' &&
            config.positiveSublabelText !== ''
              ? config.positiveSublabelText
              : 'Very Likely'
          }
        />
      </div>,
      <div className="clearfix" key="4">
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
      </div>
    ]

    if (mode !== 'builder') {
      display.push(
        <div key="5" className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      )
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
