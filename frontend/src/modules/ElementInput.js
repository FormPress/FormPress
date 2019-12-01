import React, { Component } from 'react'

export class ElementInput extends Component {
  render() {
    return (
      <div className='elementInput oh'>
        <div className='fl label'>
          {this.props.label}
        </div>
        <div className='fl input'>
          <input />
        </div>
      </div>
    );
  }
}
