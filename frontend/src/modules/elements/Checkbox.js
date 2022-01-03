import React, { Component } from 'react'

import { cloneDeep } from 'lodash'

import EditableLabel from '../common/EditableLabel'
import EditableList from '../common/EditableList'
import ElementContainer from '../common/ElementContainer'

import './Checkbox.css'

export default class Checkbox extends Component {
  static weight = 3

  static defaultConfig = {
    id: 0,
    type: 'Checkbox',
    label: 'Label',
    options: ['New Checkbox'],
    toggle: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Make this field toggle']
      }
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
    return entry.value.map((input, index) => {
      return (
        <div className="input" key={index}>
          <input
            type={input.type.toLowerCase()}
            id={'q_required_' + index}
            className={input.toggle === true ? 'toggle-checkbox' : ''}
            defaultChecked={input.value}
            disabled
            readOnly
          />
          {input.toggle === true ? <span className="slider"></span> : null}
          <label
            className={
              input.type.toLowerCase() +
              '-label ' +
              (input.toggle === true ? 'toggle-label' : '')
            }
            htmlFor={'q_required_' + index}>
            {input.content}
          </label>
        </div>
      )
    })
  }

  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
  }

  handleAddingItem(id) {
    const { config } = this.props
    if (typeof config.options === 'undefined') {
      config.options = [`New ${config.type}`]
    }

    const newOptions = cloneDeep(config.options)
    newOptions.push(`New ${config.type}`)

    this.props.configureQuestion({
      id: id,
      newState: {
        options: newOptions
      }
    })
  }

  handleDeletingItem(id) {
    const { config } = this.props
    const options = config.options
    const newOptions = options.filter((option, index) => index !== id)

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.checked = config.value === true
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    let display
    if (mode === 'builder') {
      display = [
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          dataPlaceholder="Type a question"
          required={config.required}
        />,
        <div key="2" className={config.toggle === true ? 'toggle' : ''}>
          <EditableList
            config={config}
            mode={mode}
            options={options}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            handleLabelChange={this.props.handleLabelChange}
            customBuilderHandlers={this.props.customBuilderHandlers}
          />
        </div>
      ]
    } else {
      display = [
        <EditableLabel
          key="1"
          className="fl label"
          mode={mode}
          labelKey={config.id}
          dataPlaceholder="Type a question"
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div
          key="2"
          className={
            config.toggle === true ? 'checkboxCover toggle' : 'checkboxCover'
          }>
          {options.map((item, key) => {
            return (
              <div className="fl input" key={key}>
                <input
                  type="checkbox"
                  id={`q_${config.id}_${key}`}
                  name={`q_${config.id}`}
                  value={item}
                  {...inputProps}
                />
                {config.toggle === true ? <span className="slider"></span> : ''}
                <label
                  className="checkbox-label"
                  htmlFor={`q_${config.id}_${key}`}>
                  {item}
                </label>
              </div>
            )
          })}
        </div>
      ]
    }
    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
        {mode === 'viewer' ? (
          ''
        ) : (
          <div className="clearfix">
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
        )}
        <div className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      </ElementContainer>
    )
  }
}
