import React, { Component } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGripHorizontal,
  faTrash,
  faAngleDown,
  faAngleUp,
  faClone
} from '@fortawesome/free-solid-svg-icons'

export default class ElementContainer extends Component {
  constructor(props) {
    super(props)

    this.myRef = React.createRef()
  }

  handleDeleteClick(id, e) {
    e.stopPropagation()
    this.props.customBuilderHandlers.onDelete(id)
  }

  handleFormItemMovement(item, movementType) {
    this.props.customBuilderHandlers.handleFormItemMovement(item, movementType)
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
        className={classNames.join(' ')}
        {...{ id: `qc_${config.id}`, ...builderHandlers }}
        ref={this.myRef}>
        {this.props.children}
        {mode === 'builder' ? (
          <div
            className="action"
            onDragStart={customBuilderHandlers.handleDragStart.bind(this, {
              mode: 'sort',
              ref: this.myRef,
              ...config
            })}
            onDragEnd={customBuilderHandlers.handleDragEnd}
            draggable>
            <FontAwesomeIcon icon={faGripHorizontal} className="sortHandle" />
            <div className="popover-container">
              <FontAwesomeIcon
                icon={faAngleDown}
                onClick={this.handleFormItemMovement.bind(
                  this,
                  {
                    mode: 'sort',
                    ref: this.myRef,
                    ...config
                  },
                  'moveDown'
                )}
                className="moveButton"
              />
              <div className="popoverText">Move Down</div>
            </div>
            <div className="popover-container">
              <FontAwesomeIcon
                icon={faAngleUp}
                onClick={this.handleFormItemMovement.bind(
                  this,
                  {
                    mode: 'sort',
                    ref: this.myRef,
                    ...config
                  },
                  'moveUp'
                )}
                className="moveButton"
                popover-data="up"
              />
              <div className="popoverText">Move Up</div>
            </div>
            <div className="popover-container">
              <FontAwesomeIcon
                icon={faClone}
                onClick={this.handleFormItemMovement.bind(
                  this,
                  {
                    mode: 'sort',
                    ref: this.myRef,
                    ...config
                  },
                  'clone'
                )}
              />
              <div className="popoverText">Clone</div>
            </div>
            <div className="popover-container">
              <FontAwesomeIcon
                icon={faTrash}
                onClick={this.handleDeleteClick.bind(this, config.id)}
              />
              <div className="popoverText">Delete</div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }
}
