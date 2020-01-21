import React from 'react'

const AuthContext = React.createContext({
  token: '',
  setAuth: () => {}
})

export default AuthContext
