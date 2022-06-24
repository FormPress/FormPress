import React, { Component } from 'react'

import EditableLabel from '../common/EditableLabel'
import ElementContainer from '../common/ElementContainer'
import Separator from './Separator'
import { faHeading } from '@fortawesome/free-solid-svg-icons'

import './Header.css'

export default class Header extends Component {
  static weight = 13

  static defaultConfig = {
    id: 0,
    type: 'Header',
    label: '',
    sublabel: ''
  }

  static metaData = {
    icon: faHeading,
    displayText: 'Header'
  }

  static configurableSettings = {
    separator: {
      default: false,
      formProps: {
        type: 'Checkbox',
        label: '',
        options: ['Add a separator between headers?']
      }
    },
    alignment: {
      default: 'Center',
      formProps: {
        type: 'Radio',
        options: ['Center', 'Left', 'Right'],
        label: 'Header aligment'
      }
    }
  }

  render() {
    const { config, mode } = this.props
    const inputProps = {}
    const alignmentClassName = `align${config.alignment}`

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
            className={'header label ' + alignmentClassName}
            mode={mode}
            labelKey={config.id}
            handleLabelChange={this.props.handleLabelChange}
            value={config.label}
            dataPlaceholder="Type a header"
          />
        </h2>
        {config.separator === true ? <Separator {...this.props} /> : null}
        <h4>
          <EditableLabel
            className={'header sublabel ' + alignmentClassName}
            mode={mode}
            labelKey={`header_${config.id}`}
            handleLabelChange={this.props.handleLabelChange}
            value={config.sublabel}
            dataPlaceholder="Type a subheader"
          />
        </h4>
      </ElementContainer>
    )
  }
}
