import React, { Component } from 'react'
import { cloneDeep } from 'lodash'

import EditableList from '../common/EditableList'
import ElementContainer from '../common/ElementContainer'

import './List.css'
import EditableLabel from '../common/EditableLabel'

export default class List extends Component {
  constructor(props) {
    super(props)

    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)
    this.config = props.config
  }

  static weight = 1

  static defaultConfig = {
    id: 0,
    type: 'List',
    label: 'List',
    itemType: 'Item'
  }

  static configurableSettings = {
    required: {
      default: true,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required?'
      }
    }
  }

  handleAddingItem() {
    const { config } = this.props.selectedField
    if (typeof config.options === 'undefined') {
      config.options = [`New ${config.type}`]
    }

    const newOptions = cloneDeep(config.options)
    newOptions.push(`New ${config.type}`)

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
  }

  handleDeletingItem(id) {
    const { config } = this.props.selectedField
    const options = config.options
    const newOptions = options.filter((option, index) => index !== id)

    this.props.configureQuestion({
      id: config.id,
      newState: {
        options: newOptions
      }
    })
  }

  customBuilderHandlers = {}

  render() {
    const { config, mode, selectedLabelId, selectedField } = this.props

    let className = ''

    // just for dropdown compatibility, needs to be removed after question properties conditionality update
    if (selectedField.config.hasDataset) {
      className += ' dn'
    }

    const inputProps = {}
    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    if (typeof config.min !== 'undefined') {
      inputProps.min = this.props.config.min
    }
    if (typeof config.max !== 'undefined') {
      inputProps.max = this.props.config.max
    }

    return (
      <ElementContainer
        type={config.type}
        {...this.props}
        className={className ? className : ''}>
        <div className="elemLabelTitle">
          <EditableLabel
            className="fl label"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            required={config.required}
          />
        </div>
        <EditableList
          config={config}
          mode={mode}
          order={this.props.order}
          options={selectedField.config.options || []}
          handleAddingItem={this.handleAddingItem}
          handleDeletingItem={this.handleDeletingItem}
          handleLabelChange={this.props.handleLabelChange}
          handleLabelClick={this.props.handleLabelClick}
          customBuilderHandlers={this.props.customBuilderHandlers}
          selectedLabelId={selectedLabelId}
          selectedField={selectedField}
          itemType={config.itemType}
        />
      </ElementContainer>
    )
  }
}
