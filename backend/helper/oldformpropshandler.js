const path = require('path')
const fs = require('fs')

const sourcePath = path.resolve(
  './',
  'script',
  'transformed',
  'ConfigurableSettings.js'
)

console.log(sourcePath)

fs.access(sourcePath, fs.F_OK, (err) => {
  if (err) {
    console.log('File is not exist and we have a problem.')
    console.error(err)
    return
  } else {
    console.log('File is already exist. But we have another problem.')
  }
})

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
