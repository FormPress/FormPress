import React, { Component } from 'react'

export default class Button extends Component {
  static weight = 2

  static defaultConfig = {
    id: 0,
    type: 'Button',
    buttonText: 'Submit'
  }

  render() {
    const { config, ...rest } = this.props
    const inputProps = {}
    console.log('Full props ', Object.keys(this.props))
    console.log('Rest on button ', Object.keys(rest))
    if (typeof config.onClick !== 'undefined') {
      inputProps.onClick = config.onClick
    }

    return (
      <div className='element elementButton' { ...rest }>
        <input type='submit' value={ config.buttonText } { ...inputProps } />
      </div>
    )
  }
}
