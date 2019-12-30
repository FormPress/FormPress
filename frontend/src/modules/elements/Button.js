import React, { Component } from 'react'

export default class Button extends Component {
  render() {
    return (
      <div className='element elementButton'>
        <input type='submit' value={this.props.value} />
      </div>
    )
  }
}
