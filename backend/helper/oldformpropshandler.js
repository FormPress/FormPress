const path = require('path')

const { getConfigurableSettings } = require(path.resolve(
  './',
  'script',
  'transformed',
  'ConfigurableSettings.js'
))

const { cloneDeep } = require('lodash')

exports.updateFormPropsWithNewlyAddedProps = (formProps) => {
  let updatedFormProps = cloneDeep(formProps)

  for (const formElement of updatedFormProps.elements) {
    for (const elem in getConfigurableSettings(formElement.type)) {
      if (elem in formElement !== true) {
        formElement[elem.toString()] = getConfigurableSettings(
          formElement.type
        )[elem].default
      }
    }
  }

  return updatedFormProps
}
