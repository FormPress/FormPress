import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGripHorizontal, faTrash } from '@fortawesome/free-solid-svg-icons'

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
      type,
      className
    } = this.props
    const classNames = ['element', 'oh']

    classNames.push(`element${type}`)

    if (config.id === selectedFieldId) {
      classNames.push('selected')
    }

    if (typeof className !== 'undefined') {
      classNames.push(className.trim())
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
              <div
                className='sortHandle'
                onDragStart={
                  customBuilderHandlers.handleDragStart.bind(
                    this,
                    { mode: 'sort', ...config }
                  )
                }
                onDragEnd={ customBuilderHandlers.handleDragEnd }
                draggable
              >
                <FontAwesomeIcon
                  icon={ faGripHorizontal }
                />
              </div>
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
