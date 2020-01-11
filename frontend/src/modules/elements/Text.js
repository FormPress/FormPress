import React, { Component } from 'react'
import './Text.css'

export default class Text extends Component {
  static weight = 1

  static defaultProps = {
    id: 0,
    type: 'Text',
    label: 'Label'
  }

  render() {
    const { props } = this.props

    return (
      <div className='element elementText oh' { ...this.props }>
        <div className='fl label'>
          {props.label}
        </div>
        <div className='fl input'>
          <input id={`q_${props.id}`} name={`q_${props.id}`}/>
        </div>
      </div>
    )
  }
}
