import React, { Component } from 'react'

export default class TextArea extends Component {
  static weight = 1

  static defaultConfig = {
    id: 0,
    type: 'TextArea',
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
      <div className='element elementArea oh' { ...this.props }>
        <div className='fl label'>
          { config.label }
        </div>
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
