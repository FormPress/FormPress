import React, { Component } from 'react'
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
      handleLabelClick,
      handleAddingItem,
      handleDeletingItem,
      selectedField,
      selectedLabelId,
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

    let DraggingElement, dropPlaceHolder

    if (draggingItemType) {
      DraggingElement = Elements[draggingItemType]
      dropPlaceHolder = (
        <div key="dropPlaceHolder" className="dropPlaceHolder">
          <DraggingElement config={DraggingElement.defaultConfig} />
        </div>
      )
    }

    let formElements = []
    let autoPageBreakEnabled = false

    const { autoPageBreak } = this.props.form.props

    if (
      autoPageBreak &&
      autoPageBreak.active &&
      autoPageBreak.elemPerPage > 0
    ) {
      autoPageBreakEnabled = true

      const formElementsPerPage = parseInt(autoPageBreak.elemPerPage) || 0

      let pageBreakId = 0
      let elemCounter = 0

      if (formElementsPerPage > 0) {
        this.props.form.props.elements.forEach((element) => {
          // if element is a page break, ignore it
          if (element.type === 'PageBreak') {
            return
          }

          if (elemCounter === formElementsPerPage) {
            pageBreakId++
            formElements.push({
              id: `autoPB_${pageBreakId}`,
              type: 'PageBreak',
              nextButtonText: autoPageBreak.nextButtonText || 'Next',
              previousButtonText: autoPageBreak.prevButtonText || 'Previous',
              submitButtonText: autoPageBreak.submitButtonText || 'Submit',
              style: 'start',
              autoPageBreak: true
            })
            elemCounter = 0
          }
          elemCounter++
          formElements.push(element)
        })
      }
    } else {
      formElements = this.props.form.props.elements
    }

    // handle multi-page form
    const formPagesCount =
      formElements.filter((e) => e.type === 'PageBreak').length + 1

    let pages = []
    let page = []
    let pageNumber = 1
    let copiedPageBreak
    let emptyPage = true
    formElements.forEach((element, index) => {
      if (this.props.mode === 'builder') {
        element.order = index
      }
      // push copied page break to page
      if (element.type !== 'PageBreak') {
        page.push(element)
        emptyPage = false
      } else {
        element.pageNumber = pageNumber
        element.empty = emptyPage
        element.maxPages = formPagesCount
        element.style =
          pageNumber === formPagesCount
            ? 'end'
            : 1 < pageNumber && pageNumber < formPagesCount
            ? 'between'
            : 'start'
        copiedPageBreak = Object.assign({}, element)
        page.push(element)
        pages.push(page)
        page = []
        pageNumber++
        emptyPage = true
      }
    })

    if (copiedPageBreak) {
      copiedPageBreak.pageNumber = pageNumber
      copiedPageBreak.reflection = true
      copiedPageBreak.empty = emptyPage
      copiedPageBreak.style = pageNumber === formPagesCount ? 'end' : 'between'

      page.push(copiedPageBreak)
      copiedPageBreak = null
    }

    if (page.length > 0) {
      pages.push(page)
    }

    const output = pages.map((page, index) => {
      return [
        <div
          key={index}
          className={
            className +
            ` formPage-${index + 1}` +
            (autoPageBreakEnabled ? ' autoPageBreak' : '') +
            ` ${
              this.props.mode === 'renderer' && index > 0 ? 'form-hidden' : ''
            }`
          }
          data-fp-pagenumber={index + 1}
          {...builderHandlers}>
          {page.map((elem) => {
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

            if (elem.id === selectedField) {
              extraProps.className = 'selected'
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

            if (elem.id === 'isUnselectable') {
              if (elem.value === false) extraProps.className = 'elementHider'
            }

            if (elem.id === 'countriesType') {
              if (elem.value === 'US') {
                extraProps.className = 'elementHider'
              }
            }

            if (elem.type === 'PageBreak') {
              if (elem.empty === true) {
                extraProps.className = 'emptyPage'
              }
              if (elem.reflection === true) {
                extraProps.className += ' reflection'
              }
            }

            const renderList = [
              <Component
                key={elem.id}
                id={elem.id}
                config={elem}
                form_id={this.props.form.id}
                order={elem.order}
                rteUploadHandler={this.props.rteUploadHandler}
                builderHandlers={builderHandlers}
                customBuilderHandlers={customBuilderHandlers}
                handleLabelChange={handleLabelChange}
                handleLabelClick={handleLabelClick}
                handleAddingItem={handleAddingItem}
                handleDeletingItem={handleDeletingItem}
                configureQuestion={configureQuestion}
                selectedField={selectedField}
                selectedLabelId={selectedLabelId}
                {...extraProps}
              />
            ]

            if (
              this.props.dragIndex === elem.id.toString() &&
              this.props.dragging === true
            ) {
              if (this.props.insertBefore === true) {
                renderList.unshift(dropPlaceHolder)
              } else {
                renderList.push(dropPlaceHolder)
              }
            }

            return renderList.length === 1 ? renderList[0] : renderList
          })}

          {this.props.form.props.elements.length === 0 &&
            this.props.dragging === true &&
            dropPlaceHolder}

          {this.props.form.props.customCSS === undefined ? null : (
            <link
              rel="stylesheet"
              type="text/css"
              href={'data:text/css;base64, ' + encodedCSS}
            />
          )}
        </div>
      ]
    })

    output.length === 0
      ? output.push(
          <div key={1} className={className} {...builderHandlers}></div>
        )
      : null
    return output
  }
}

Renderer.defaultProps = {
  mode: 'viewer',
  theme: 'gleam',
  allowInternal: false
}
