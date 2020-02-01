import React, { Component } from 'react'

export default class ElementContainer extends Component {
  render() {
    const { config, ddHandlers, mode, type } = this.props

    return (
      <div
        className={`element element${type} oh`}
        {...{ id: config.id, ...ddHandlers }}
      >
        { this.props.children }
      </div>
    )
  }
}
