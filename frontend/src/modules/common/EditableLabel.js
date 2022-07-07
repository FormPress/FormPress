import React from 'react'
import { Editor } from '@tinymce/tinymce-react'

export default function EditableLabel(props) {
  let limit = 256,
    order = 0

  function handleOnInput(e) {
    const text = e.target.innerText

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
    extraProps.className += ' rteContainer'
    extraProps.contentEditable = false
    if (typeof props.labelKey === 'string') {
      order = props.order + '_' + props.labelKey
    } else {
      order = props.order
    }
    return (
      <div {...extraProps}>
        <Editor
          key={order}
          apiKey="8919uh992pdzk74njdu67g6onb1vbj8k8r9fqsbn16fjtnx2"
          value={props.value}
          init={{
            plugins: 'link image code',
            toolbar:
              'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | outdent indent removeformat image ',
            file_picker_types: 'image',
            automatic_uploads: true,
            images_file_types: 'jpg,svg,png,jpeg',
            images_upload_handler: props.rteUploadHandler,
            resize: false,
            paste_block_drop: true,
            paste_data_images: false
          }}
          onClick={() => {
            const elem = document
              .getElementById(window.tinyMCE.activeEditor.id)
              .closest('.element')
            if (!elem.classList.contains('selected')) elem.click()
          }}
          onEditorChange={(newValue) => {
            if (newValue.length >= 2000) newValue = newValue.substr(0, 2000)
            props.handleLabelChange(props.labelKey, newValue)
          }}
        />
      </div>
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
        {...extraProps}
        dangerouslySetInnerHTML={{
          __html: props.value
            ? props.value
                .replace(/<span(.*?)>(.*?)<\/span>/, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, ' ')
                .replace(/(<([^>]+)>)/gi, '')
                .trim()
                .substr(0, limit)
            : ''
        }}></span>
    </div>
  )
}
