import React, { Component } from 'react'
import './CopyToClipboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

class CopyToClipboard extends Component {
  copyURL(e) {
    let copyDiv

    if (this.props.children !== undefined) {
      copyDiv = e.target.closest('div.clipboardButton_custom')
        .nextElementSibling
    } else {
      copyDiv = e.target.nextElementSibling
    }
    if (copyDiv) {
      copyDiv.classList.add('animate')
      copyDiv.addEventListener('animationend', () =>
        copyDiv.classList.remove('animate')
      )
      navigator.clipboard.writeText(this.props.clipboardData)
    }
  }
  render() {
    if (this.props.children !== undefined) {
      return (
        <div className="copyToClipboardArea_custom">
          <div
            className="clipboardButton_custom"
            onClick={(e) => this.copyURL(e)}>
            {this.props.children}
          </div>
          <span className="copyAlert">Copied!</span>
        </div>
      )
    }

    return (
      <div className="copyToClipboardArea">
        <div className="copyToClipBoardCover">
          {this.props.buttonText}
          <button
            className="clipboardButton"
            type="button"
            onClick={(e) => this.copyURL(e)}>
            <FontAwesomeIcon
              icon={faLink}
              className="clipboardIcon unselectable"
            />
          </button>
          <span className="copyAlert">Copied!</span>
        </div>
      </div>
    )
  }
}
export default CopyToClipboard
