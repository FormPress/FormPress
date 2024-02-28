const path = require('path')
const reactDOMServer = require('react-dom/server')
const React = require('react')
const Renderer = require(
  path.resolve('script', 'transformed', 'Renderer')
).default

const props = {
  className: 'fl form',
  form: {
    elements: [
      {
        id: 1,
        type: 'TextBox',
        label: 'First Name'
      },
      {
        id: 2,
        type: 'Button',
        value: 'Submit'
      }
    ]
  }
}

const str = reactDOMServer.renderToStaticMarkup(
  React.createElement(Renderer, props)
)

console.log('str ', str)
