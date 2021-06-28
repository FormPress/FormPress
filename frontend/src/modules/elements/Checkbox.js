import React, { Component } from 'react'

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
    options: ['Checkbox 1'],
    requiredText: 'Please fill this field.',
    sublabelText: 'sublabel Text'
  }

  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
  }

  handleAddingItem() {
    const { config } = this.props
    if (typeof config.options === 'undefined') {
      config.options = [`${config.type} 1`]
    }

    const newOptions = config.options
    newOptions.push(`${config.type} ${newOptions.length + 1}`)

    this.props.configureQuestion({
      id: config.id,
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
              className={`sublabel ${
                config.sublabelText === '' ||
                typeof config.sublabelText === 'undefined'
                  ? 'emptySpan'
                  : ''
              }`}
              mode={mode}
              labelKey={`sub_${config.id}`}
              handleLabelChange={this.props.handleLabelChange}
              value={
                typeof config.sublabelText !== 'undefined'
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
