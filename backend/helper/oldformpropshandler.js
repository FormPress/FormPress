exports.updateFormPropsWithNewlyAddedProps = (
  formProps,
  getConfigurableSettings
) => {
  let updatedFormProps = formProps.elements

  updatedFormProps.forEach((formElement, index) => {
    for (const elem in getConfigurableSettings(formElement.type)) {
      if (elem in formElement !== true) {
        updatedFormProps[index][elem.toString()] = getConfigurableSettings(
          formElement.type
        )[elem].default
      }
    }
  })

  formProps.elements = updatedFormProps

  return formProps
}
