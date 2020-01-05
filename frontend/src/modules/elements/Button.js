import React, { Component } from 'react'

export default class Button extends Component {
  static weight = 2

  static defaultProps = {
    id: 0,
    type: 'Button',
    value: 'Submit'
  }

  render() {
    const { props, ...rest} = this.props

    return (
      <div className='element elementButton' { ...rest }>
        <input type='submit' value={props.value} />
      </div>
    )
  }
}
