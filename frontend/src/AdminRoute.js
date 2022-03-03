import React from 'react'
import { Route, Redirect } from 'react-router-dom'

import AuthContext from './auth.context'

const AdminRoute = ({ children, component, ...rest }) => {
  return (
    <AuthContext.Consumer>
      {(value) => (
        <Route
          {...rest}
          render={(props) => {
            const Component = component

            return value.loggedIn === true ? (
              //user_role=1 admin
              value.user_role === 1 || value.admin === true ? (
                component !== undefined ? (
                  <Component {...props} />
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
    </AuthContext.Consumer>
  )
}

export default AdminRoute
