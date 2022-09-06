import React, { Component } from 'react'
import AuthContext from '../../auth.context'
import { api } from '../../helper'

import './Whitelist.css'

class Whitelist extends Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      data: []
    }
  }

  getWhitelist = async () => {
    this.setState({ loaded: false })
    const { data } = await api({
      resource: `/api/admin/whitelist`
    })
    this.setState({ loaded: true, data })
  }

  async componentDidMount() {
    await this.getWhitelist()
  }

  render() {
    const { data, loaded } = this.state
    return (
      <div className="wlwrap">
        <div className="col-4-16 wllist">
          {loaded &&
            data.map((user) => (
              <div className="wl" key={user.email}>
                {user.email}
              </div>
            ))}
        </div>
      </div>
    )
  }
}

const WhitelistWrapped = (props) => (
  <AuthContext.Consumer>
    {(value) => <Whitelist {...props} auth={value} />}
  </AuthContext.Consumer>
)

export default WhitelistWrapped
