import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

export default class ElementContainer extends Component {
  handleDeleteClick (id, e) {
    e.stopPropagation()
    this.props.customBuilderHandlers.onDelete(id)
  }

  render() {
    const {
      builderHandlers,
      config,
      customBuilderHandlers,
      mode,
      selectedFieldId,
      type
    } = this.props
    const classNames = ['element', 'oh']

    classNames.push(`element${type}`)

    if (config.id === selectedFieldId) {
      classNames.push('selected')
    }

    return (
      <div
        className={ classNames.join(' ') }
        {...{ id: `qc_${config.id}`, ...builderHandlers }}
      >
        { this.props.children }
        {
          (mode === 'builder')
            ? <div className='action'>
              <FontAwesomeIcon
                icon={ faTrash }
                onClick={ this.handleDeleteClick.bind(this, config.id) }
              />
            </div>
            : null
        }
        
      </div>
    )
  }
}
