import React, { Component } from 'react'

import EditableLabel from '../EditableLabel'

export default class Button extends Component {
  static weight = 2

  static defaultConfig = {
    id: 0,
    type: 'Button',
    buttonText: 'Submit'
  }

  render() {
    const { config, mode, ...rest } = this.props
    const inputProps = {}

    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    return (
      <div className='element elementButton' { ...rest }>
        { (mode === 'builder')
          ? <button { ...inputProps }>
            <EditableLabel
              className='fl label'
              mode={ this.props.mode }
              labelKey={ config.id }
              handleLabelChange={ this.props.handleLabelChange }
              value={ config.buttonText }
            />
          </button>
          : <input type='submit' value={ config.buttonText } { ...inputProps } />
        }
      </div>
    )
  }
}
