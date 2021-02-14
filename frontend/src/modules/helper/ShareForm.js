import React from 'react'
import { useParams } from 'react-router-dom'
import ShareFormLeftTab from './ShareFormTabs/ShareFormLeftTab'
import ShareFormRightTab from './ShareFormTabs/ShareFormRightTab'

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
      <ShareFormLeftTab embedCode={embedCode} backEnd={BACKEND} formId={formId} />
      <ShareFormRightTab />
    </div>
  )
}