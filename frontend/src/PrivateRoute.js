import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import AuthContext from './auth.context'

const PrivateRoute = ({ children, component, ...rest }) => {
  return (
    <AuthContext.Consumer>
      {(value) => (
        <Route
          {...rest}
          render={(props) => {
            const Component = component

            return value.loggedIn === true ? (
              component !== undefined ? (
                <Component {...props} />
              ) : (
                children
              )
            ) : (
              <Redirect
                to={{
                  pathname: '/login',
                  state: { from: props.location }
                }}
              />
            )
          }}
        />
      )}
    </AuthContext.Consumer>
  )
}

export default PrivateRoute
