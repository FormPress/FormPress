import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import GeneralContext from './general.context'

const PrivateRoute = ({ children, component, ...rest }) => {
  return (
    <GeneralContext.Consumer>
      {(value) => (
        <Route
          {...rest}
          render={(props) => {
            const Component = component

            return value.auth.loggedIn === true ? (
              component !== undefined ? (
                <Component generalContext={value} {...props} />
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
    </GeneralContext.Consumer>
  )
}

export default PrivateRoute
