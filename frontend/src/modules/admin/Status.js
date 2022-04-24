import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import CapabilitiesContext from '../../capabilities.context'

class Status extends Component {
  constructor(props) {
    super(props)
    this.state = {
      saved: true,
      loaded: false,
      selectedUserId: 0,
      message: ''
    }
  }
}

const StatusWrapped = (props) => (
    <CapabilitiesContext.Consumer>
      {(capabilities) => (
        <AuthContext.Consumer>
          {(value) => (
            <Status {...props} auth={value} capabilities={capabilities} />
          )}
        </AuthContext.Consumer>
      )}
    </CapabilitiesContext.Consumer>
  )

export default StatusWrapped
