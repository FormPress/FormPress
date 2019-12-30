import React, { Component } from 'react'
import './Text.css'

export default class Text extends Component {
  render() {
    return (
      <div className='element elementText oh'>
        <div className='fl label'>
          {this.props.label}
        </div>
        <div className='fl input'>
          <input />
        </div>
      </div>
    )
  }
}
