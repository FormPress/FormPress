import * as Elements from '../modules/elements'
import { getConfigurableSettings } from '../modules/ConfigurableSettings'
const excludedKeys = [
  'Button',
  'Header',
  'Separator',
  'PageBreak',
  'Image',
  'CAPTCHA'
]

const keys = Object.keys(Elements)
for (const key of keys) {
  describe(`Element ${key} component`, () => {
    if (!excludedKeys.includes(key)) {
      test('Does it have a valid configurable settings', () => {
        expect(getConfigurableSettings(key)).toHaveProperty('required')
        expect(getConfigurableSettings(key)).toHaveProperty('requiredText')
      })
    }
  })
}
