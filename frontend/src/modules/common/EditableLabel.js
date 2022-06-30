import React from 'react'
import { Editor } from '@tinymce/tinymce-react'

const BACKEND = process.env.REACT_APP_BACKEND

export default function EditableLabel(props) {
  function handleOnInput(e) {
    const text = e.target.innerText
    let limit = 256

    if (typeof props.limit !== 'undefined') {
      limit = props.limit
    }

    if (text.length >= limit) {
      e.target.innerText = text.substr(0, limit)
      props.handleLabelChange(props.labelKey, e.target.innerText)

      e.target.focus()
      document.execCommand('selectAll', false, null)
      document.getSelection().collapseToEnd()
    }
  }

  function handleOnBlur(e) {
    props.handleLabelChange(props.labelKey, e.target.innerText)
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

  if (props.editor === true) {
    return (
      <Editor
        apiKey={process.env.TINYMCE_API_KEY}
        value={props.value}
        init={{
          plugins: 'link image code',
          toolbar:
            'undo redo | formatselect | ' +
            'bold italic backcolor | alignleft aligncenter ' +
            'alignright alignjustify | outdent indent removeformat image ',
          file_picker_types: 'image',
          automatic_uploads: true,
          images_file_types: 'jpg,svg,png',
          images_upload_url: `${BACKEND}/api/upload`,
          image_dimensions: false,
          resize: false,
          paste_block_drop: true
        }}
        onEditorChange={(newValue) => {
          props.handleLabelChange(props.labelKey, newValue)
        }}
      />
    )
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
        {props.value
          .replace(/<span(.*?)>(.*?)<\/span>/, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, ' ')
          .replace(/(<([^>]+)>)/gi, '')
          .trim()}
      </span>
    </div>
  )
}
