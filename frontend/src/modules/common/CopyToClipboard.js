import React, { Component } from 'react'
import './CopyToClipboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

class CopyToClipboard extends Component {
  copyURL(e) {
    const copyDiv = e.target.nextElementSibling
    if (copyDiv) {
      copyDiv.classList.add('animate')
      copyDiv.addEventListener('animationend', () =>
        copyDiv.classList.remove('animate')
      )
      navigator.clipboard.writeText(this.props.clipboardData)
    }
  }
  render() {
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
