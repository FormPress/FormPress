import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import GeneralContext from './general.context'

const AdminRoute = ({ children, component, ...rest }) => {
  return (
    <GeneralContext.Consumer>
      {(value) => (
        <Route
          {...rest}
          render={(props) => {
            const Component = component

            return value.auth.loggedIn === true ? (
              //user_role=1 admin
              value.auth.user_role === 1 || value.auth.admin === true ? (
                component !== undefined ? (
                  <Component {...props} generalContext={value} />
                ) : (
                  children
                )
              ) : (
                <Redirect
                  to={{
                    pathname: '/forms'
                  }}
                />
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

export default AdminRoute
