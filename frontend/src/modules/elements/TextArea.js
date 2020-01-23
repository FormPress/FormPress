import React, { Component } from 'react'

import EditableLabel from '../EditableLabel'

export default class TextArea extends Component {
  static weight = 1

  static defaultConfig = {
    id: 0,
    type: 'TextArea',
    label: 'Label'
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
      <div className='element elementArea oh'  {...{ id: config.id, ...this.props.ddHandlers }}>
        <EditableLabel
          className='fl label'
          mode={ mode }
          labelKey={ config.id }
          handleLabelChange={ this.props.handleLabelChange }
          value={ config.label }
        />
        <div className='fl input'>
          <textarea
            id={ `q_${config.id}` }
            name={ `q_${config.id}` }
            { ...inputProps }
          >
          </textarea>
        </div>
      </div>
    )
  }
}
