import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faGripHorizontal,
  faTrash,
  faAngleDown,
  faAngleUp,
  faClone,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons'

export default function ElementContainer(props) {
  const myRef = React.createRef()

  function handleDeleteClick(id, e) {
    e.stopPropagation()
    props.customBuilderHandlers.onDelete(id)
  }

  function handleFormItemMovement(item, movementType) {
    props.customBuilderHandlers.handleFormItemMovement(item, movementType)
  }

  let {
    builderHandlers,
    config,
    customBuilderHandlers,
    mode,
    selectedFieldId,
    type,
    className
  } = props

  const classNames = ['element', 'oh']

  classNames.push(`element${type}`)

  if (config.id === selectedFieldId) {
    classNames.push('selected')
  }

  if (typeof className !== 'undefined') {
    classNames.push(className.trim())
  }

  const unCloneableTypes = ['PageBreak', 'CAPTCHA']

  const isCloneable = !unCloneableTypes.includes(type)

  return (
    <div
      className={classNames.join(' ')}
      {...{
        id: `qc_${config.id}`,
        'data-fp-custom-field-id': config.customFieldId
          ? `qc_${config.customFieldId}`
          : null,
        ...builderHandlers
      }}
      ref={myRef}>
      {mode === 'builder' && config.hidden === true ? (
        <div className="hiddenElement">
          <FontAwesomeIcon icon={faEyeSlash} />
          <div className="hiddenElementText">
            {' '}
            This element is hidden, which means it will not be visible to users
            who fill out your form.
          </div>
        </div>
      ) : null}
      {props.children}
      {mode === 'builder' ? (
        <div
          className="action"
          onDragStart={customBuilderHandlers.handleDragStart.bind(this, {
            mode: 'sort',
            ref: myRef,
            ...config
          })}
          onDragEnd={customBuilderHandlers.handleDragEnd}
          draggable>
          <FontAwesomeIcon icon={faGripHorizontal} className="sortHandle" />
          <div className="popover-container action-down">
            <FontAwesomeIcon
              icon={faAngleDown}
              onClick={handleFormItemMovement.bind(
                this,
                {
                  mode: 'sort',
                  ref: myRef,
                  ...config
                },
                'moveDown'
              )}
              className="moveButton"
            />
            <div className="popoverText">Move Down</div>
          </div>
          <div className="popover-container action-up">
            <FontAwesomeIcon
              icon={faAngleUp}
              onClick={handleFormItemMovement.bind(
                this,
                {
                  mode: 'sort',
                  ref: myRef,
                  ...config
                },
                'moveUp'
              )}
              className="moveButton"
              popover-data="up"
            />
            <div className="popoverText">Move Up</div>
          </div>
          {isCloneable ? (
            <div className="popover-container action-clone">
              <FontAwesomeIcon
                icon={faClone}
                onClick={handleFormItemMovement.bind(
                  this,
                  {
                    mode: 'sort',
                    ref: myRef,
                    ...config
                  },
                  'clone'
                )}
              />
              <div className="popoverText">Clone</div>
            </div>
          ) : null}
          <div className="popover-container action-delete">
            <FontAwesomeIcon
              icon={faTrash}
              onClick={handleDeleteClick.bind(this, config.id)}
            />
            <div className="popoverText">Delete</div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
