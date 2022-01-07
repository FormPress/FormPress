import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import './Modal.css'

class Modal extends Component {
  onClick = () => {
    document.getElementsByClassName('modal-overlay')[0].click();
  }

  render() {
    const modalContent = this.props.modalContent;
    if (this.props.isOpen === true) {
      return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={this.props.handleOutsideClick}>
          <div
            className="modal-wrapper"
            onClick={(e) => {
              e.stopPropagation()
            }}>
            <div className={`wrapper-header ${modalContent.status}`}>{modalContent.header}<span className="close-modal" onClick={this.onClick}>x</span></div>
            <div className="wrapper-body">{modalContent.content}</div>
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
