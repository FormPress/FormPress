import React, { Component } from 'react'
import Renderer from '../Renderer'

import './QuestionProperties.css'

export default class QuestionProperties extends Component {
  constructor(props) {
    super(props)

    this.handleFieldChange = this.handleFieldChange.bind(this)
    this.elementHider = this.elementHider.bind(this)
  }

  handleFieldChange(elem, e) {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value

    this.props.configureQuestion({
      id: this.props.selectedField.config.id,
      newState: {
        [elem.id]: value
      }
    })

    if (e.target.id === 'q_required' && value === true) {
      let newValue = elem.value
      let elemId = elem.id.split('_')[1]
      this.props.configureQuestion({
        id: this.props.selectedField.config.id,
        newState: {
          [elemId]: newValue
        }
      })
    }
  }

  elementHider(formElems) {
    const { selectedField } = this.props
    const elemType = selectedField.config.type

    if (!formElems.find((elem) => elem.id === 'required')?.value) {
      formElems.find((elem) => elem.id === 'requiredText').hidden = true
    }

    switch (elemType) {
      case 'Dropdown':
        if (formElems.find((elem) => elem.id === 'hasDataset').value) {
          formElems.find((elem) => elem.id === 'dropdownOptions').hidden = true
        } else {
          formElems.find((elem) => elem.id === 'dataset').hidden = true
        }
        break
      case 'Name':
        if (!formElems.find((elem) => elem.id === 'prefix').value) {
          formElems.find(
            (elem) => elem.id === 'prefixTypeTextBox'
          ).hidden = true

          formElems.find((elem) => elem.id === 'prefixOptions').hidden = true
        }
        break
    }
  }

  render() {
    const { selectedField } = this.props

    if (typeof selectedField === 'undefined') {
      return null
    }

    const { configurableSettings, config } = selectedField
    const form = {
      props: {
        elements: []
      }
    }
    const keys = Object.keys(configurableSettings)

    for (const key of keys) {
      const question = configurableSettings[key]

      if (config[key] === undefined) {
        config[key] = question.default
      }

      form.props.elements.push(
        Object.assign({ id: key }, question.formProps, {
          value: config[key]
        })
      )
    }

    this.elementHider(form.props.elements)

    return (
      <div className="questionProperties">
        <div className="questionPropertiesMessage">
          Here you can change the question properties to your liking.
        </div>
        <div className="wrapper-questionProperties">
          <div className="question-info">
            <div className="qlabel">{selectedField.config.label}</div>
            <div className="qtype">{selectedField.config.type}</div>
          </div>

          <Renderer
            theme="infernal"
            className="questionPropertiesForm"
            selectedField={selectedField}
            handleFieldChange={this.handleFieldChange}
            handleAddingItem={this.handleAddingItem}
            handleDeletingItem={this.handleDeletingItem}
            form={form}
          />
        </div>
      </div>
    )
  }
}
