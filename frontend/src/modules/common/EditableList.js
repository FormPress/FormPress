import React, { Component } from 'react'
import EditableLabel from './EditableLabel'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {
  faMinusCircle,
  faTrash,
  faAngleDown,
  faAngleUp,
  faClone
} from '@fortawesome/free-solid-svg-icons'

import './EditableList.css'

class EditableList extends Component {
  constructor(props) {
    super(props)
    this.handleAddingItem = this.handleAddingItem.bind(this)
    this.handleDeletingItem = this.handleDeletingItem.bind(this)

    this.myRef = React.createRef()
  }

  handleAddingItem() {
    this.props.handleAddingItem()
  }

  handleDeletingItem(id) {
    this.props.handleDeletingItem(id)
  }

  handleFormItemMovement(item, movementType) {
    this.props.customBuilderHandlers.handleFormItemMovement(item, movementType)
  }

  render() {
    const { config, mode, options, customBuilderHandlers } = this.props

    if (config.type === 'Checkbox') {
      const display = [
        options.map((item, key) => {
          return (
            <div className="fl input" key={key}>
              <input
                key={`s_${key}`}
                type="checkbox"
                id={`q_${config.id}_${key}`}
                name={`q_${config.id}`}
                value={item}
              />
              {config.toggle === true ? <span className="slider"></span> : ''}
              <EditableLabel
                className="label checkbox-label"
                mode={mode}
                labelKey={`s_${config.id}_${key}`}
                htmlFor={`q_${config.id}_${key}`}
                handleLabelChange={this.props.handleLabelChange}
                customBuilderHandlers={{
                  onDelete: this.handleFormElementDeleteClick,
                  handleDragEnd: this.handleDragEnd,
                  handleDragStart: this.handleDragStart,
                  handleFormItemMovement: this.handleFormItemMovement
                }}
                value={item}
              />
              <div className="action">
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    onClick={customBuilderHandlers.handleFormItemMovement.bind(
                      this,
                      {
                        mode: 'sort',
                        ref: this.myRef,
                        value: item,
                        id: key
                      },
                      'moveDown',
                      'listItem'
                    )}
                    className="moveButton"
                  />
                  <div className="popoverText">Move Down</div>
                </div>
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faAngleUp}
                    onClick={customBuilderHandlers.handleFormItemMovement.bind(
                      this,
                      {
                        mode: 'sort',
                        ref: this.myRef,
                        value: item,
                        id: key
                      },
                      'moveUp',
                      'listItem'
                    )}
                    className="moveButton"
                    popover-data="up"
                  />
                  <div className="popoverText">Move Up</div>
                </div>
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faClone}
                    onClick={customBuilderHandlers.handleFormItemMovement.bind(
                      this,
                      {
                        mode: 'sort',
                        ref: this.myRef,
                        value: item,
                        id: key
                      },
                      'clone',
                      'listItem'
                    )}
                  />
                  <div className="popoverText">Clone</div>
                </div>
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faTrash}
                    onClick={() => this.handleDeletingItem(parseInt(`${key}`))}
                  />
                  <div className="popoverText">Delete</div>
                </div>
              </div>
            </div>
          )
        }),
        <div
          key="2"
          className={
            config.toggle === true
              ? 'builderAddNewButton addNewToggle'
              : `'builderAddNewButton addNew${config.type}`
          }
          onClick={this.handleAddingItem}>
          Add New {config.toggle === true ? 'Toggle' : `${config.type}`}
        </div>
      ]

      return <div className="checkboxCover">{display}</div>
    } else if (config.type === 'Radio') {
      return (
        <ul>
          {options.map((item, key) => {
            return (
              <li key={key}>
                <input
                  type="radio"
                  id={`q_${config.id}_${key}`}
                  name={`q_${config.id}`}
                  value={item}></input>
                <EditableLabel
                  className="label radio-label"
                  mode={mode}
                  labelKey={`s_${config.id}_${key}`}
                  htmlFor={`q_${config.id}_${key}`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={item}
                />
                <div className="action">
                  <div className="popover-container">
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      onClick={customBuilderHandlers.handleFormItemMovement.bind(
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
                      onClick={customBuilderHandlers.handleFormItemMovement.bind(
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
                      onClick={customBuilderHandlers.handleFormItemMovement.bind(
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
                      onClick={() =>
                        this.handleDeletingItem(parseInt(`${key}`))
                      }
                    />
                    <div className="popoverText">Delete</div>
                  </div>
                </div>
              </li>
            )
          })}
          <div
            className={`'builderAddNewButton addNew${config.type}`}
            onClick={this.handleAddingItem}>
            Add New {`${config.type}`}
          </div>
        </ul>
      )
    } else if (config.type === 'Dropdown') {
      return (
        <select className="dropdown-select" name={`q_${config.id}`}>
          <option selected disabled>
            Choose one
          </option>
          {options.map((item, key) => {
            return (
              <option className="option-space" key={item} value={item}>
                <EditableLabel
                  className="label radio-label"
                  mode={mode}
                  labelKey={`s_${config.id}_${key}`}
                  htmlFor={`q_${config.id}_${key}`}
                  handleLabelChange={this.props.handleLabelChange}
                  value={item}
                />
                <span className="delete-element-button">
                  <FontAwesomeIcon
                    icon={faMinusCircle}
                    title="Delete Field"
                    onClick={() => this.handleDeletingItem(parseInt(`${key}`))}
                  />
                </span>
              </option>
            )
          })}
        </select>
      )
    }
  }
}

export default EditableList
