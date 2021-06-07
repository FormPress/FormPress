import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import EditableList from '../common/EditableList'
import ElementContainer from '../common/ElementContainer'

import './Radio.css'

export default class Radio extends Component {
  static weight = 6

  static defaultConfig = {
    id: 0,
    type: 'Radio',
    label: 'Radio',
    options: ['Radio 1'],
    requiredText: 'Please fill this field.'
  }

  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
  }

  handleAddingItem() {
    const { config } = this.props
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

    const options =
      Array.isArray(config.options) === true ||
      typeof config.options !== 'undefined'
        ? config.options
        : ['']

    var display
    if (mode === 'builder') {
      display = [
        <EditableLabel
          key="1"
          className="label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div key="2" className="fl input">
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
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />,
        <div key="2" className="fl input">
          <ul>
            {config.options.map((item, key) => {
              return (
                <li key={key}>
                  <input
                    type="radio"
                    id={`q_${config.id}_${key}`}
                    name={`q_${config.id}`}
                    value={item}></input>
                  <label
                    className="radio-label"
                    htmlFor={`q_${config.id}_${key}`}>
                    {item}
                  </label>
                  <div className="check">
                    <div className="inside"></div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>,
        <div key="3" className="fl metadata">
          <div className="requiredErrorText">{config.requiredText}</div>
        </div>
      ]
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        {display}
      </ElementContainer>
    )
  }
}
