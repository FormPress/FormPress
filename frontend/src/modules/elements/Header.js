import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import './Header.css'

export default class Header extends Component {
  static weight = 10

  static defaultConfig = {
    id: 0,
    type: 'Header',
    label: 'Header',
    sublabel: 'sub header'
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}

    if (typeof config.value !== 'undefined') {
      inputProps.value = config.value
    }

    if (typeof this.props.onChange !== 'undefined') {
      inputProps.onChange = this.props.onChange
    }

    return (
      <ElementContainer type={config.type} {...this.props}>
        <h2>
          <EditableLabel
            className="header label"
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            data-placeholder="Type a header"
          />
        </h2>
        <h4>
          <EditableLabel
            className="header sublabel"
            mode={mode}
            labelKey={`header_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            value={config.sublabel}
            data-placeholder="Type a subheader"
          />
        </h4>
      </ElementContainer>
    )
  }
}
