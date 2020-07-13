import React, { Component } from 'react'
import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import { Dropdown } from 'semantic-ui-react'

const options = [
  { key: 'Item1', text: 'Item1', value: 'Item1', icon: 'trash' },
  { key: 'Item2', text: 'Item2', value: 'Item2', icon: 'trash' },
  { key: 'Item3', text: 'Item3', value: 'Item3', icon: 'trash' },
  { key: 'Item4', text: 'Item4', value: 'Item4', icon: 'trash' },
  { key: 'Item5', text: 'Item5', value: 'Item5', icon: 'trash' }
]

export default class CustomDropdown extends Component {
  static weight = 5
  state = { options }

  static defaultConfig = {
    id: 0,
    type: 'CustomDropdown',
    label: 'Choose'
  }

  static configurableSettings = {
    required: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: 'Make this field required?'
      }
    }
  }

  handleAddition = (e, { value }) => {
    this.setState((prevState) => ({
      options: [{ text: value, value }, ...prevState.options],
    }))
  }

  handleChange = (e, { value }) => this.setState({ currentValue: value })


  render() {
    const { config, mode } = this.props
    const { currentValue } = this.state

    return (
      <ElementContainer type={config.type} {...this.props}>
        <EditableLabel
          className='fl label'
          mode={mode}
          labelKey={config.id}
          handleLabelChange={this.props.handleLabelChange}
          value={config.label}
          required={config.required}
        />
        <Dropdown 
          clearable options={this.state.options}
          placeholder='Choose...'
          search
          selection
          scrolling
          allowAdditions
          multiple
          value={currentValue}
          onAddItem={this.handleAddition}
          onChange={this.handleChange}
        />
      </ElementContainer>
    )
  }
}