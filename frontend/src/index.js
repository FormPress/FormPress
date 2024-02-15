import React from 'react'
import { createRoot } from 'react-dom/client'

import './style/normalize.css'
import './style/grid.css'
import './style/common.css'
import './index.css'

import App from './App'

global.env = {}
// necessary for the api to work
global.env.FE_BACKEND = process.env.REACT_APP_FE_BACKEND
global.env.FE_FRONTEND = process.env.REACT_APP_FE_FRONTEND
global.env.FP_ENV = process.env.NODE_ENV

// if backend and frontend are undefined, set it manually using hostname
if (
  global.env.FE_BACKEND === undefined ||
  global.env.FE_FRONTEND === undefined
) {
  const hostname = window.location.hostname
  global.env.FE_BACKEND = `https://${hostname}`
  global.env.FE_FRONTEND = `https://${hostname}`
}

let render = true
//Redirect to https on production
function redirectHttpsIfNeeded() {
  const { protocol, host, pathname } = window.location

  if (protocol === 'http:' && global.env.FP_ENV === 'production') {
    console.log('Redirecting to https', `${protocol}${host}${pathname}`)
    window.location.href = `https://${host}${pathname}`
    render = false
  }
}

redirectHttpsIfNeeded()

if (render === true) {
  const root = createRoot(document.getElementById('root'))
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}
