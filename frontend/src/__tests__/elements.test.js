import React from 'react'
import { create } from 'react-test-renderer'
import * as Elements from '../modules/elements'

const keys = Object.keys(Elements)
console.log('process.argv', process.argv)
for (const key of keys) {
  const Component = Elements[key]

  describe(`Element ${key} component`, () => {
    test('Has weight and defaultConfig static attributes defined', () => {
      expect(Component.weight).toBeDefined()
      expect(Component.defaultConfig).toBeDefined()
    })

    test('Can be rendered without errors', () => {
      const component = create(<Component props={Component.defaultConfig}/>)
    })
  })  
}
