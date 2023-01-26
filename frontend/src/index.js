import React from 'react'
import ReactDOM from 'react-dom'

import './style/normalize.css'
import './style/grid.css'
import './style/common.css'
import './index.css'

import App from './App'

global.env = {}
global.env.FP_ENV = process.env.NODE_ENV
let render = true
global.env.FE_BACKEND = 'http://localhost:3001'
global.env.FE_FRONTEND = 'http://localhost:3000'
//Redirect to https on production
if (global.env.FP_ENV === 'production') {
  global.env.FE_BACKEND = `https://${window.location.hostname}`
  global.env.FE_FRONTEND = `https://${window.location.hostname}`
  const { location } = document
  const { protocol, host, pathname } = location

  if (protocol === 'http:') {
    console.log('Redirecting to https ', `${protocol}${host}${pathname}`)
    window.location = `https://${host}${pathname}`
    render = false
  }
}

if (render === true) {
  ReactDOM.render(<App />, document.getElementById('root'))
}
