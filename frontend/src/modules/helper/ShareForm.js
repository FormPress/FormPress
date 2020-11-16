import React from 'react'
import { useParams } from 'react-router-dom'

import './ShareForm.css'

const BACKEND = process.env.REACT_APP_BACKEND

export default function ShareForm() {
  const { formId } = useParams()

  const embedCode = [
    `<script src="${BACKEND}/runtime/embed.js">`,
    '</script>'
  ].join('\n')

  return (
    <div className="col-15-16 shareForm">
      <div>
        Form URL:{' '}
        <input
          type="text"
          value={`${BACKEND}/form/view/${formId}`}
          className="formURL"
          readOnly
        />
      </div>
      <div>
        Form Embed Code: <br />
        <textarea className="embedCode" value={embedCode} readOnly />
      </div>
    </div>
  )
}
