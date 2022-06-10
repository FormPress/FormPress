import React, { Component } from 'react'

import ElementContainer from '../common/ElementContainer'
import { faMinus } from '@fortawesome/free-solid-svg-icons'

import './Separator.css'

export default class Separator extends Component {
  static weight = 12

  static defaultConfig = {
    id: 0,
    type: 'Separator'
  }

  static metaData = {
    icon: faMinus,
    displayText: 'Separator'
  }

  render() {
    const { config } = this.props
    return (
      <ElementContainer type={config.type} {...this.props}>
        <div>
          <hr className="solid" />
        </div>
      </ElementContainer>
    )
  }
}
