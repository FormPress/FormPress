/*
  Generic method handles api requests
*/

const BACKEND = process.env.REACT_APP_BACKEND

let token = ''

export const setToken = (_token) => {
  token = _token
}

export const api = ({ resource, method = 'get', body, useAuth = true }) =>
  new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Content-Type': 'application/json'
      },
      method
    }

    if (useAuth === true) {
      options.headers['Authorization'] = `Bearer ${token}`
    }

    if (typeof body !== 'undefined') {
      options.body = typeof body === 'object' ? JSON.stringify(body) : body
    }

    let success = true
    let status

    fetch(`${BACKEND}${resource}`, options)
      .then((response) => {
        success = response.ok
        status = response.status

        return response.json()
      })
      .then((data) => {
        resolve({ success, status, data })
      })
      .catch(reject)
  })
