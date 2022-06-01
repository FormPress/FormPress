import React, { Component } from 'react'
import * as StandartElements from './elements'
import * as InternalElements from './internal'

export default class Renderer extends Component {
  render() {
    let { className } = this.props
    const {
      dragging,
      dragMode,
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

    // handle multi-page form
    const formPagesCount =
      this.props.form.props.elements.filter((e) => e.type === 'PageBreak')
        .length + 1

    let pages = []
    let page = []
    let pageNumber = 1
    let copiedPageBreak
    let emptyPage = true
    this.props.form.props.elements.forEach((element) => {
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
                  <div key="dropPlaceHolder" className="dropPlaceHolder"></div>
                )
              } else {
                renderList.push(
                  <div key="dropPlaceHolder" className="dropPlaceHolder"></div>
                )
              }
            }

            return renderList.length === 1 ? renderList[0] : renderList
          })}

          {this.props.form.props.elements.length === 0 &&
            this.props.dragging === true && (
              <div key="dropPlaceHolder" className="dropPlaceHolder"></div>
            )}

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

    this.props.mode === 'builder'
      ? output.push(
          <div
            key={`pb-newPage`}
            onClick={customBuilderHandlers.handleAddNewPage}
            className="pagebreak-new-placeholder">
            Click here to add a new page.
          </div>
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
