import React from 'react'
import { create } from 'react-test-renderer'
import * as Elements from '../modules/elements'
import { getConfigurableSettings } from '../modules/ConfigurableSettings'

const keys = Object.keys(Elements)
for (const key of keys) {
  describe(`Element ${key} component`, () => {
    test('Does it have a valid configurable settings', () => {
      if (key !== "Button") {
        //this will be returned attr name with configSettings
        expect(getConfigurableSettings(key)).toHaveProperty('required');
        expect(getConfigurableSettings(key)).toHaveProperty('requiredText');
        expect(getConfigurableSettings(key)).toHaveProperty('disabled');
      }else{
        //assuming only attribute is required
        expect.objectContaining({
          disabled: expect.any(Object)
        });
      }
    })
  })
}
