import React, { Component } from 'react'
import './CopyToClipboard.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLink } from '@fortawesome/free-solid-svg-icons'

class CopyToClipboard extends Component {
	render() {
		return (
			<div className="copyToClipboardArea">
				<div className="copyToClipBoardCover">
					{this.props.buttonText}
					<button
						className="clipboardButton"
						type="button"
						onClick={() =>
							navigator.clipboard.writeText(this.props.clipboardData)
						}>
						<FontAwesomeIcon icon={faLink} className="clipboardIcon" />
					</button>
				</div>
			</div>
		)
	}
}
export default CopyToClipboard
