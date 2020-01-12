import React from 'react'
import Builder from './modules/Builder'
import Data from './modules/Data'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

import './App.css'

function App() {
  return (
    <Router>
      <div>
        <nav className='nav'>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/forms">Forms</Link>
            </li>
            <li>
              <Link to="/editor">Editor</Link>
            </li>
            <li>
              <Link to="/data">Data</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path="/">
            <h1>Welcome to FormPress</h1>
          </Route>
          <Route path="/forms">
            Forms
          </Route>
          <Route path="/editor">
            <Builder />
          </Route>
          <Route path="/data">
            <Data />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
