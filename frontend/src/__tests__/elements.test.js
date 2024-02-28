import React from 'react'
import { render, screen } from '@testing-library/react'

import * as Elements from '../modules/elements'

const ElementsWithNoNameAttribute = [
  'Button',
  'Header',
  'Separator',
  'Address',
  'PageBreak',
  'Image',
  'CAPTCHA'
]

const ElementsWithMultipleNameAttribute = [
  'Name',
  'Address',
  'DatePicker',
  'Location',
  'RatingScale',
  'NetPromoterScore'
]

const keys = Object.keys(Elements)
process.env.FE_BACKEND = 'backendUrlForTests'

for (const key of keys) {
  const Component = Elements[key]

  describe(`Element ${key} component`, () => {
    test('Has weight and defaultConfig static attributes defined', () => {
      expect(Component.weight).toBeDefined()
      expect(Component.defaultConfig).toBeDefined()
    })

    test('Can be rendered without errors', () => {
      render(<Component config={Component.defaultConfig} />)
    })

    if (ElementsWithNoNameAttribute.includes(key) === false) {
      if (ElementsWithMultipleNameAttribute.includes(key)) {
        test('Has multiple <name> attributes', async () => {
          render(<Component config={Component.defaultConfig} />)
          const element = screen.getByTestId(`qc_${Component.defaultConfig.id}`)
          const input = element.querySelectorAll('input[name]')
          expect(input.length).toBeGreaterThan(1)
        })
      } else {
        test('Has single <name> attribute', async () => {
          render(<Component config={Component.defaultConfig} />)
          const element = screen.getByTestId(`qc_${Component.defaultConfig.id}`)
          const input = element.querySelectorAll(
            `[name=q_${Component.defaultConfig.id}]`
          )
          expect(input).toHaveLength(1)
        })
      }
    }
  })
}
