/*
  Generic method handles api requests
*/

export const api = ({
  resource,
  method = 'get',
  body,
  useAuth = true,
  useBlob = false
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

    options.credentials = 'include' // TODO: debugging purposes. remove and improve.

    if (typeof body !== 'undefined') {
      options.body = typeof body === 'object' ? JSON.stringify(body) : body
    }

    let success = true
    let status

    fetch(`${global.env.FE_BACKEND}${resource}`, options)
      .then((response) => {
        success = response.ok
        status = response.status

        if (useBlob && success) {
          return response.blob()
        } else {
          return response.json()
        }
      })
      .then((data) => {
        resolve({ success, status, data })
      })
      .catch(reject)
  })
