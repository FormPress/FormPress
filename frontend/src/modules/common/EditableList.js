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

  handleAddingItem(id) {
    this.props.handleAddingItem(id)
  }

  handleDeletingItem(id) {
    this.props.handleDeletingItem(id)
  }

  handleFormItemMovement = (item, movementType, itemType) => {
    this.props.customBuilderHandlers.handleFormItemMovement(
      item,
      movementType,
      itemType
    )
  }

  render() {
    const { mode, options, customBuilderHandlers, selectedLabelId } = this.props

    let { config } = this.props

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
                dataPlaceholder="Type an option"
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
                    onClick={() =>
                      customBuilderHandlers.handleFormItemMovement(
                        {
                          mode: 'sort',
                          ref: this.myRef,
                          ...config,
                          listItemId: key
                        },
                        'moveDown',
                        'listItem'
                      )
                    }
                    className="moveButton"
                  />
                  <div className="popoverText">Move Down</div>
                </div>
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faAngleUp}
                    onClick={() =>
                      customBuilderHandlers.handleFormItemMovement(
                        {
                          mode: 'sort',
                          ref: this.myRef,
                          ...config,
                          listItemId: key
                        },
                        'moveUp',
                        'listItem'
                      )
                    }
                    className="moveButton"
                    popover-data="up"
                  />
                  <div className="popoverText">Move Up</div>
                </div>
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faClone}
                    onClick={() =>
                      customBuilderHandlers.handleFormItemMovement(
                        {
                          mode: 'sort',
                          ref: this.myRef,
                          ...config,
                          listItemId: key
                        },
                        'clone',
                        'listItem'
                      )
                    }
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
          onClick={() => this.handleAddingItem(parseInt(config.id))}>
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
                  form_id={config.form_id}
                  question_id={config.id}
                  rteUploadHandler={this.props.rteUploadHandler}
                  order={this.props.order}
                  editor={
                    this.props.editorForOptions &&
                    selectedLabelId === `s_${config.id}_${key}`
                  }
                  dataPlaceholder="Type an option"
                  labelKey={`s_${config.id}_${key}`}
                  htmlFor={`q_${config.id}_${key}`}
                  handleLabelChange={this.props.handleLabelChange}
                  handleLabelClick={this.props.handleLabelClick}
                  value={item}
                  limit={2000}
                />
                <div className="action">
                  <div className="popover-container">
                    <FontAwesomeIcon
                      icon={faAngleDown}
                      onClick={() =>
                        customBuilderHandlers.handleFormItemMovement(
                          {
                            mode: 'sort',
                            ref: this.myRef,
                            ...config,
                            listItemId: key
                          },
                          'moveDown',
                          'listItem'
                        )
                      }
                      className="moveButton"
                    />
                    <div className="popoverText">Move Down</div>
                  </div>
                  <div className="popover-container">
                    <FontAwesomeIcon
                      icon={faAngleUp}
                      onClick={() =>
                        customBuilderHandlers.handleFormItemMovement(
                          {
                            mode: 'sort',
                            ref: this.myRef,
                            ...config,
                            listItemId: key
                          },
                          'moveUp',
                          'listItem'
                        )
                      }
                      className="moveButton"
                      popover-data="up"
                    />
                    <div className="popoverText">Move Up</div>
                  </div>
                  <div className="popover-container">
                    <FontAwesomeIcon
                      icon={faClone}
                      onClick={() =>
                        customBuilderHandlers.handleFormItemMovement(
                          {
                            mode: 'sort',
                            ref: this.myRef,
                            ...config,
                            listItemId: key
                          },
                          'clone',
                          'listItem'
                        )
                      }
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
            onClick={() => this.handleAddingItem(parseInt(config.id))}>
            Add New {`${config.type}`}
          </div>
        </ul>
      )
    } else {
      config = this.props.selectedField.config
      const universalEditableList = [
        options.map((item, key) => {
          return (
            <div className="fl input" key={key}>
              <EditableLabel
                className="label"
                mode={'builder'}
                dataPlaceholder="Type an option"
                labelKey={`s_${config.id}_${key}`}
                htmlFor={`q_${config.id}_${key}`}
                handleLabelChange={this.props.handleLabelChange}
                customBuilderHandlers={customBuilderHandlers}
                value={item}
              />
              <div className="action">
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faAngleDown}
                    onClick={() =>
                      customBuilderHandlers.handleFormItemMovement(
                        {
                          mode: 'sort',
                          ref: this.myRef,
                          ...config,
                          listItemId: key
                        },
                        'moveDown',
                        'listItem'
                      )
                    }
                    className="moveButton"
                  />
                  <div className="popoverText">Move Down</div>
                </div>
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faAngleUp}
                    onClick={() =>
                      customBuilderHandlers.handleFormItemMovement(
                        {
                          mode: 'sort',
                          ref: this.myRef,
                          ...config,
                          listItemId: key
                        },
                        'moveUp',
                        'listItem'
                      )
                    }
                    className="moveButton"
                    popover-data="up"
                  />
                  <div className="popoverText">Move Up</div>
                </div>
                <div className="popover-container">
                  <FontAwesomeIcon
                    icon={faClone}
                    onClick={() =>
                      customBuilderHandlers.handleFormItemMovement(
                        {
                          mode: 'sort',
                          ref: this.myRef,
                          ...config,
                          listItemId: key
                        },
                        'clone',
                        'listItem'
                      )
                    }
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
          className={'builderAddNewButton addNewItem'}
          onClick={() => this.handleAddingItem(parseInt(config.id))}>
          Add New Item
        </div>
      ]

      return (
        <div className="universalEditableList">{universalEditableList}</div>
      )
    }
  }
}

export default EditableList
