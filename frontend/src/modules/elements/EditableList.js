import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'

import './EditableList.css'

export default class EditableList extends Component {
  static weight = -1

  static defaultConfig = {
    id: 0,
    type: 'EditableList',
    label: 'Editable List',
    options: ['item 1']
  }

  constructor(props) {
    super(props)
    this.state = {
      show: true,
      items: this.props
    }
    this.handleChange = this.handleChange.bind(this)
    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
  }

  handleChange(event) {
    const { config } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    const newOptions = []

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
  }

  handleAddingItem() {
    this.props.handleAddingItem()
  }

  handleDeletingItem(e) {
    console.log(e)
    //this.props.handleDeletingItem()
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className="fl label"
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <br />
        <br />
        <div className="questionPropertiesCheckboxMenu">
          {this.props.selectedField.config.options.map((elem, key) => {
            return (
              <div
                key={key}
                className="questionPropertiesCheckbox"
                onClick={this.handleDeletingItem}>
                {elem}
              </div>
            )
          })}
          {}
          <div
            className={`questionPropertiesCheckbox questionPropertiesAddNewButton ${
              this.props.selectedField.config.options.length % 2 === 0
                ? 'fullButton'
                : 'halfButton'
            }`}
            onClick={this.handleAddingItem}>
            Add New Checkbox
          </div>
        </div>
      </ElementContainer>
    )
  }
}
