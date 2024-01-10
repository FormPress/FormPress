import React from 'react'
import './Footer.css'

export default function Footer() {
  const YEAR = new Date().getFullYear()
  return (
    <footer className="footer cw center grid">
      <div className="col-8-16">Copyright © {YEAR} formpress.org</div>
      <div className="col-8-16 tr">
        <a href={`mailto:support@${global.env.FE_EMAIL_DOMAIN}`}>Contact</a>
      </div>
    </footer>
  )
}
