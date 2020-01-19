const path = require('path')
const assert = require('assert').strict
const apiMiddleware = require(path.resolve('middleware', 'api'))
const endpoints = require(path.resolve('config', 'endpoints'))

const words = ['post', 'get', 'delete', 'put']
const expressMock = {}

for (const word of words) {
  expressMock[`data_${word}`] = [],
  expressMock[word] = (path) => {
    expressMock[`data_${word}`].push(path)
  }
}

apiMiddleware(expressMock)

describe('Api', () => {
  describe('Endpoints coverage in middleware', () => {
    for (const endpoint of endpoints.endpoints) {
      it(`Endpoint in config/endpoints.js(${endpoint.method}::${endpoint.path}) actually defined in api middleware only once`, () => {
        const filtered = expressMock[`data_${endpoint.method}`]
          .filter((mocked_endpoint) => mocked_endpoint === endpoint.path)

        assert.equal(filtered.length, 1)
      })
    }
  })

  describe('Endpoints coverage in config/endpoints.js', () => {
    for (const word of words) {
      for (const mocked_endpoint of expressMock[`data_${word}`]) {
        it(`Endpoint in api middleware(${word}::${mocked_endpoint}) is defined in config/endpoints.js only once`, () => {
          const filtered = endpoints
            .endpoints
            .filter(
              (endpoint) => (
                endpoint.path === mocked_endpoint && endpoint.method === word
              )
            )

          assert.equal(filtered.length, 1)
        })
      }
    }
  })
})
