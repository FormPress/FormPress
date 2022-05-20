import React from 'react'
import './NotFoundPage.css'

const NotFoundPage = () => (
	<div className="not-found-page">
		<div className="not-found-container">
			<div className="not-found-img">
				<img
					src="https://storage.googleapis.com/static.formpress.org/images/NotFoundPage.svg"
					className="img-responsive"
				/>
			</div>
			<div className="not-found-text">
				<h1>404</h1>
				<h2>Page Not Found</h2>
				<h4>it seems this page doesn&apos;t exist in our servers.</h4>
				<a href="/" className="not-found-button">
					HOMEPAGE
				</a>
			</div>
		</div>
	</div>
)

export default NotFoundPage
