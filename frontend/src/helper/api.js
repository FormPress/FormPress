/*
  Generic method handles api requests
*/

export const api = ({
  resource,
  method = 'get',
  body,
  useAuth = true,
  responseType = 'json'
}) =>
  new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Content-Type': 'application/json'
      },
      method
    }

    if (useAuth === true) {
      options.credentials = 'include'
    }

    options.credentials = 'include'

    if (typeof body !== 'undefined') {
      options.body = typeof body === 'object' ? JSON.stringify(body) : body
    }

    let success = true
    let status

    fetch(`${global.env.FE_BACKEND}${resource}`, options)
      .then((response) => {
        success = response.ok
        status = response.status

        switch (responseType) {
          case 'blob':
            return response.blob()
          case 'text':
            return response.text()
          case 'json':
          default:
            return response.json()
        }
      })
      .then((data) => {
        resolve({ success, status, data })
      })
      .catch(reject)
  })
