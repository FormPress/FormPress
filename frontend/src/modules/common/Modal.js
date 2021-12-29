import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './Modal.css'

class Modal extends Component {
  render() {
    if (this.props.isOpen === true) {
      return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={this.props.handleOutsideClick}>
          <div
            className="modal-wrapper"
            onClick={(e) => {
              e.stopPropagation()
            }}>
            {this.props.children}
          </div>
        </div>,
        document.getElementById('portal')
      )
    } else {
      return null
    }
  }
}
export default Modal
