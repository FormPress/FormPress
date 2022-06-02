import React, { Component } from 'react'
const { cloneDeep } = require('lodash')
import * as StandartElements from './elements'
import * as InternalElements from './internal'

export default class Renderer extends Component {
  render() {
    let { className } = this.props
    const {
      dragging,
      dragMode,
      draggingItemType,
      sortItem,
      customBuilderHandlers,
      configureQuestion,
      builderHandlers,
      handleLabelChange,
      handleAddingItem,
      handleDeletingItem,
      selectedField,
      theme,
      allowInternal
    } = this.props

    let Elements = { ...StandartElements }
    if (allowInternal === true) {
      Elements = { ...StandartElements, ...InternalElements }
    }

    if (this.props.dragging === true) {
      className += ' dragging'
    }

    className += ` ${this.props.mode} ${theme}`

    let encodedCSS
    if (this.props.form.props.customCSS !== undefined) {
      const decodedCSS = this.props.form.props.customCSS.value
      const buff = Buffer.from(decodedCSS, 'utf8')
      encodedCSS = buff.toString('base64')
    }

    let DraggingElement

    if (draggingItemType) {
      DraggingElement = Elements[draggingItemType]
    }

    return (
      <div className={className} {...builderHandlers}>
        {this.props.form.props.elements.map((elem) => {
          const Component = Elements[elem.type]
          const extraProps = { mode: this.props.mode }

          if (typeof this.props.handleFieldChange === 'function') {
            extraProps.onChange = (e) => {
              this.props.handleFieldChange(elem, e)
            }
          }

          // Hide sorted item
          if (
            dragging === true &&
            dragMode === 'sort' &&
            sortItem.id === elem.id
          ) {
            extraProps.className = 'dn'
          }

          // conditionally hide elements for QuestionProperties page
          if (elem.id === 'required') {
            if (elem.value === false) {
              extraProps.className = 'elementHider'
            }
          }

          if (elem.id === 'hasDataset') {
            if (elem.value === false) extraProps.className = 'elementHider'
          }

          if (elem.id === 'prefix') {
            if (elem.value.default === false)
              extraProps.className = 'elementHider'
            if (elem.value === false) extraProps.className = 'elementHider'
          }

          if (elem.id === 'prefixTypeTextBox') {
            if (elem.value === true) extraProps.className = 'elementHider'
          }

          const renderList = [
            <Component
              key={elem.id}
              id={elem.id}
              config={elem}
              builderHandlers={builderHandlers}
              customBuilderHandlers={customBuilderHandlers}
              handleLabelChange={handleLabelChange}
              handleAddingItem={handleAddingItem}
              handleDeletingItem={handleDeletingItem}
              configureQuestion={configureQuestion}
              selectedField={selectedField}
              {...extraProps}
            />
          ]

          if (
            this.props.dragIndex === elem.id.toString() &&
            this.props.dragging === true
          ) {
            if (this.props.insertBefore === true) {
              renderList.unshift(
                <div key="dropPlaceHolder" className="dropPlaceHolder">
                  <DraggingElement config={DraggingElement.defaultConfig} />
                </div>
              )
            } else {
              renderList.push(
                <div key="dropPlaceHolder" className="dropPlaceHolder">
                  <DraggingElement config={DraggingElement.defaultConfig} />
                </div>
              )
            }
          }

          return renderList.length === 1 ? renderList[0] : renderList
        })}

        {this.props.form.props.elements.length === 0 &&
          this.props.dragging === true && (
            <div key="dropPlaceHolder" className="dropPlaceHolder">
              <DraggingElement config={DraggingElement.defaultConfig} />
            </div>
          )}

        {this.props.form.props.customCSS === undefined ? null : (
          <link
            rel="stylesheet"
            type="text/css"
            href={'data:text/css;base64, ' + encodedCSS}
          />
        )}
      </div>
    )
  }
}

Renderer.defaultProps = {
  mode: 'viewer',
  theme: 'gleam',
  allowInternal: false
}
