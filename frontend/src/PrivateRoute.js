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
            const demoModeOverride =
              value.auth.user_id === 0 && props.match?.params?.formId === 'demo'

            return value.auth.loggedIn === true || demoModeOverride === true ? (
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
