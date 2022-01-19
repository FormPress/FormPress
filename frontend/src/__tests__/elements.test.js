import React from 'react'
import { create } from 'react-test-renderer'
import * as Elements from '../modules/elements'

const excludedKeys = ["Button", "Header", "Separator"]
const keys = Object.keys(Elements)
for (const key of keys) {
  const Component = Elements[key]

  describe(`Element ${key} component`, () => {
    test('Has weight and defaultConfig static attributes defined', () => {
      expect(Component.weight).toBeDefined()
      expect(Component.defaultConfig).toBeDefined()
    })

    test('Can be rendered without errors', () => {
      const component = create(<Component config={ Component.defaultConfig }/>)
    })

    test('Has a valid <name> attribute', () => { //what is valid? "q_{id}"
      if (!excludedKeys.includes(key)) { //these elements dont have name attribute
        const component = create(<Component config={ Component.defaultConfig } mode={ "not build" }/>)
        if (key === "Name") {//Name has 2 values; first name and last name. Test should reconsidered for multiple value fields
          const myTestObject = component.root
          const nameAttributes = myTestObject.findAllByProps({name:"q_0[firstName]"})
          const multipleNames = nameAttributes.concat(myTestObject.findAllByProps({name:"q_0[lastName]"}))
          expect(multipleNames.length).toBeGreaterThan(1)
        } else {
          const myTestObject = component.root
          //assuming defaultConfig have id:0
          const nameAttributes = myTestObject.findAllByProps({name:"q_0"})//if its static "q_0" it still passes. should be improved
          const nameCount = nameAttributes.length
          expect(nameCount).toBeGreaterThan(0)
        }
      }
    })
  })
}
