import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink
} from 'react-router-dom'

import Builder from './modules/Builder'
import Data from './modules/Data'
import Forms from './modules/Forms'

import './App.css'

function App() {
  return (
    <Router>
      <div>
        <nav className='nav'>
          <ul>
            <li>
              <NavLink exact to='/' activeClassName='selected'>Home</NavLink>
            </li>
            <li>
              <NavLink to='/forms' activeClassName='selected'>Forms</NavLink>
            </li>
            <li>
              <NavLink to='/editor' activeClassName='selected'>Editor</NavLink>
            </li>
            <li>
              <NavLink to='/data' activeClassName='selected'>Data</NavLink>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path="/">
            <h1>Welcome to FormPress</h1>
          </Route>
          <Route path="/forms">
            <Forms />
          </Route>
          <Route path="/editor/:formId" component={Builder} />
          <Route path="/editor" component={Builder} />
          <Route path="/data">
            <Data />
          </Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App
