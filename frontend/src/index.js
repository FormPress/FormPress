import React from 'react'
import ReactDOM from 'react-dom'

import './style/normalize.css'
import './style/grid.css'
import './index.css'

import App from './App'

const FP_ENV = process.env.REACT_APP_FP_ENV
let render = true

//Redirect to https on production
if (FP_ENV === 'production') {
  const { location } = document
  const { protocol, host, pathname } = location

  if ( protocol === 'http:' ) {
    console.log('Redirecting to https ',`${protocol}${host}${pathname}`)
    window.location = `https://${host}${pathname}`
    render = false
  }
}

if (render === true) {
  ReactDOM.render(<App />, document.getElementById('root'))  
}
