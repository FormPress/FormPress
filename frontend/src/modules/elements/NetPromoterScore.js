import React, { Component } from 'react'

import { cloneDeep } from 'lodash'
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
    displayText: 'Net Promoter Score'
  }

  static submissionHandler = {
    getQuestionValue: (inputs, qid) => {
      let value = ''
      for (const elem of inputs) {
        if (elem.q_id === qid) {
          value = elem.value
        }
      }
      return value
    }
  }

  static IsJsonString(str) {
    try {
      JSON.parse(str)
    } catch (e) {
      return false
    }
    return true
  }

  static dataContentOrganizer(dataContentValue, element) {
    const tempContentValue = cloneDeep(dataContentValue)
    let returnContent = []

    if (this.IsJsonString(tempContentValue) === false) {
      for (let elementContent of element.options) {
        if (tempContentValue === elementContent) {
          returnContent.push({
            content: elementContent,
            value: 'checked',
            type: element.type,
            toggle: element.toggle
          })
        } else {
          returnContent.push({
            content: elementContent,
            value: '',
            type: element.type,
            toggle: element.toggle
          })
        }
      }
    } else {
      for (let elementContent of element.options) {
        if (JSON.parse(tempContentValue).includes(elementContent) === true) {
          returnContent.push({
            content: elementContent,
            value: 'checked',
            type: element.type,
            toggle: element.toggle
          })
        } else {
          returnContent.push({
            content: elementContent,
            value: '',
            type: element.type,
            toggle: element.toggle
          })
        }
      }
    }

    return returnContent
  }

  static renderDataValue(entry) {
    return (
      <ul className="nps">
        {this.defaultConfig.options.map((item) => {
          return (
            <li key={item}>
              <input
                type="radio"
                id={`q_${entry.id}_${item}`}
                name={`q_${entry.id}`}
                value={item}
                className="nps-input"
                disabled="disabled"
                defaultChecked={entry.value === item}></input>
              <label
                className="net-promoter-score-label"
                htmlFor={`q_${entry.id}_${item}`}>
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
      const netPromoterScoreRadioButtons = Array.from(nodeList)

      return netPromoterScoreRadioButtons
    },
    isFilled: (value) => {
      return !value.every((item) => item.checked === false)
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    var display = [
      <h4>
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
      </h4>,
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
                  onChange={inputProps.onChange}
                  defaultChecked={config.value === item}></input>
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
      <div className="clearfix first-child" key="3">
        
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
