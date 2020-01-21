import React, { Component } from 'react'

import EditableLabel from '../EditableLabel'
import './Text.css'

export default class Text extends Component {
  static weight = 1

  static defaultConfig = {
    id: 0,
    type: 'Text',
    label: 'Label'
  }

  render() {
    const { config } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    return (
      <div className='element elementText oh' { ...this.props }>
        <EditableLabel
          className='fl label'
          mode={ this.props.mode }
          labelKey={ config.id }
          handleLabelChange={ this.props.handleLabelChange }
          value={ config.label }
        />
        <div className='fl input'>
          <input
            id={ `q_${config.id}` }
            name={ `q_${config.id}` }
            { ...inputProps }
          />
        </div>
      </div>
    )
  }
}
