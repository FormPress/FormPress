import React, { Component } from 'react'
import './CopyToClipboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

function copyURL(e) {
  const copyDiv = e.target.nextElementSibling
  if (copyDiv) {
    copyDiv.classList.add('animate')
    copyDiv.addEventListener('animationend', () =>
      copyDiv.classList.remove('animate')
    )
  }
}

class CopyToClipboard extends Component {
  render() {
    return (
      <div className="copyToClipboardArea">
        <div className="copyToClipBoardCover">
          {this.props.buttonText}
          <button
            className="clipboardButton"
            type="button"
            onClick={
              (() => navigator.clipboard.writeText(this.props.clipboardData),
              (e) => copyURL(e))
            }>
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
