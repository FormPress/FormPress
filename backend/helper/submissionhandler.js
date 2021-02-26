const parseInput = (input) => {
  let parsedInput = {}
  const question_part = input.q_id.split('_')[1]
  parsedInput.q_id = parseInt(question_part)
  if (question_part.indexOf('[') > -1) {
    parsedInput.sub_id = question_part.match(/\[(.*?)\]/)[1]
  }
  parsedInput.value = input.value

  return parsedInput
}

const getQuestionValue = (inputs, qid) => {
  let typechecker = 0
  let valueObject = {}
  let value = ''
  for (const elem of inputs) {
    if (elem.q_id === qid) {
      typechecker = 1
      if (elem.sub_id) {
        //its an object
        typechecker = 2
        valueObject[elem.sub_id] = elem.value
      } else {
        value = elem.value
      }
    }
  }
  if (typechecker === 2) {
    return valueObject
  } else if (typechecker === 1) {
    return value
  } else {
    return false
  }
}

exports.formatInput = (questions, inputs) => {
  let formattedInput = []
  const parsedInputs = inputs.map((input) => parseInput(input))
  questions.forEach((question) => {
    let value = getQuestionValue(parsedInputs, question.id)

    if (value !== false) {
      formattedInput.push({ q_id: question.id, value: value })
    }
    if (question.type === 'Checkbox') {
      if (value === false) {
        value = 'off'
      }
      formattedInput.push({ q_id: question.id, value: value })
    }
  })

  return formattedInput
}
