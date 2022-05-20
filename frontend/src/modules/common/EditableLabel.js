import React from 'react'

export default function EditableLabel(props) {
  function handleOnInput(e) {
    const text = e.target.innerText
    let limit = 256

    if (typeof props.limit !== 'undefined') {
      limit = props.limit
    }

    if (text.length >= limit) {
      e.target.innerText = text.substr(0, limit)
      props.handleLabelChange(
        props.labelKey,
        e.target.innerText
          .replace(/<span(.*?)>(.*?)<\/span>/, '')
          .replace(/(<([^>]+)>)/gi, '')
          .trim()
      )

      e.target.focus()
      document.execCommand('selectAll', false, null)
      document.getSelection().collapseToEnd()
    }
  }

  function handleOnBlur(e) {
    props.handleLabelChange(
      props.labelKey,
      e.target.innerText
        .replace(/<span(.*?)>(.*?)<\/span>/, '')
        .replace(/(<([^>]+)>)/gi, '')
        .trim()
    )
  }

  function handleOnKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
    }
  }

  function handleOnPaste(e) {
    e.preventDefault()

    // get text representation of clipboard
    var text = e.clipboardData.getData('text/plain')

    // insert text manually
    document.execCommand('insertHTML', false, text)
  }

  const extraProps = {}

  if (props.mode === 'builder') {
    extraProps.contentEditable = true
  }

  if (props.required === true) {
    extraProps.className = 'required'
  }

  return (
    <div className={props.className}>
      <span
        onInput={handleOnInput.bind(this)}
        onBlur={handleOnBlur.bind(this)}
        onKeyDown={handleOnKeyDown.bind(this)}
        onPaste={handleOnPaste.bind(this)}
        dataplaceholder={props.dataPlaceholder}
        spellCheck={false}
        suppressContentEditableWarning={true}
        className={props.value === '' ? 'emptySpan' : null}
        {...extraProps}>
        {props.value}
      </span>
    </div>
  )
}
