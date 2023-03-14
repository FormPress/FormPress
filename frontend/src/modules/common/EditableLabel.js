import React, { Component } from 'react'
import { Editor } from '@tinymce/tinymce-react'
import { debounce } from '../optimization'

class EditableLabel extends Component {
  constructor(props) {
    super(props)

    this.charLimiter = this.charLimiter.bind(this)
    this.handleOnBlur = this.handleOnBlur.bind(this)
    this.handleOnClick = this.handleOnClick.bind(this)
    this.handleOnKeyDown = this.handleOnKeyDown.bind(this)
    this.handleOnPaste = this.handleOnPaste.bind(this)
  }

  charLimiter(e) {
    const text = e.target.innerText
    let limit = 256

    if (typeof this.props.limit !== 'undefined') {
      limit = this.props.limit
    }

    let isADeletingEvent = false
    if (e.type === 'keydown') {
      isADeletingEvent = e.key === 'Backspace' || e.key === 'Delete'
    }

    if (text.length >= limit && !isADeletingEvent) {
      e.preventDefault()
    }
  }

  handleOnBlur(e) {
    this.props.handleLabelChange(this.props.labelKey, e.target.innerText)
  }

  handleOnClick() {
    this.props.handleLabelClick(this.props.labelKey)
  }

  handleOnKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      e.target.blur()
      return
    }

    this.charLimiter(e)
  }

  handleOnPaste(e) {
    this.charLimiter(e)

    e.preventDefault()

    // get text representation of clipboard
    const text = e.clipboardData.getData('text/plain')

    // insert text manually
    document.execCommand('insertHTML', false, text)
  }

  shouldComponentUpdate(nextProps) {
    // for tinymce to work properly, component should not update if the editor is active
    if (this.props.editor === true) {
      return nextProps.editor !== true
    }
    return true
  }

  render() {
    const props = this.props
    let order = 0

    const extraProps = {}

    if (props.mode === 'builder') {
      extraProps.contentEditable = true
    }

    if (props.required === true) {
      extraProps.className = 'required'
    }

    if (props.handleLabelClick !== undefined) {
      extraProps.onClick = this.handleOnClick
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
            apiKey={global.env.FE_TINYMCE_API_KEY}
            initialValue={props.value}
            init={{
              plugins: 'link image code',
              toolbar:
                'undo redo | formatselect | ' +
                'bold italic | alignleft aligncenter ' +
                'alignright alignjustify | outdent indent removeformat image ',
              file_picker_types: 'image',
              automatic_uploads: true,
              images_file_types: 'jpg,svg,png,jpeg',
              images_upload_handler: props.rteUploadHandler,
              resize: false,
              paste_block_drop: true,
              paste_data_images: false
            }}
            onEditorChange={debounce((newValue) => {
              props.handleLabelChange(props.labelKey, newValue)
            }, 1500)}
          />
        </div>
      )
    }

    return (
      <div className={props.className}>
        <span
          onBlur={this.handleOnBlur}
          onKeyDown={this.handleOnKeyDown}
          onPaste={this.handleOnPaste}
          dataplaceholder={props.dataPlaceholder}
          spellCheck={false}
          labelkey={props.labelKey}
          suppressContentEditableWarning={true}
          className={props.value === '' ? 'emptySpan' : null}
          {...extraProps}
          dangerouslySetInnerHTML={{
            __html: props.value ? props.value : ''
          }}></span>
      </div>
    )
  }
}

export default EditableLabel
