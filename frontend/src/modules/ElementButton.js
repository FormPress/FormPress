import React, { Component } from 'react'

export class ElementButton extends Component {
  render() {
    return (
      <div className='elementButton'>
        <input type='submit' value={this.props.value} />
      </div>
    )
  }
}
