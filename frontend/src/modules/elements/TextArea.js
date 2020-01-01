import React, { Component } from 'react'

export default class TextArea extends Component {
  static weight = 1

  static defaultProps = {
    id: 0,
    type: 'TextArea',
    label: 'Label'
  }

  render() {
    const { props } = this.props

    return (
      <div className='element elementArea oh' { ...this.props }>
        <div className='fl label'>
          {props.label}
        </div>
        <div className='fl input'>
          <input />
        </div>
      </div>
    )
  }
}
