import React from 'react'

const GeneralContext = React.createContext({
  auth: {
    token: '',
    setAuth: () => {}
  },
  capabilities: {}
})

export default GeneralContext
