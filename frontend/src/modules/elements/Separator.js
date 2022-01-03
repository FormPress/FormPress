import React, { Component } from 'react'

import ElementContainer from '../common/ElementContainer'

import './Separator.css'

export default class Separator extends Component {
  static weight = 11

  static defaultConfig = {
    id: 0,
    type: 'Separator'
  }

  render() {
    const { config } = this.props
    console.log(config)
    return (
      <ElementContainer type={config.type} {...this.props}>
        <div>
          <hr className="solid" />
        </div>
      </ElementContainer>
    )
  }
}
