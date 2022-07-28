const Elements = require('../script/transformed/elements/')

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

exports.formatInput = (questions, inputs) => {
  let formattedInput = []
  const parsedInputs = inputs.map((input) => parseInput(input))
  questions.forEach((question) => {
    if ('submissionHandler' in Elements[question.type]) {
      let value = Elements[question.type].submissionHandler.getQuestionValue(
        parsedInputs,
        question.id
      )

      if (value !== false) {
        formattedInput.push({ q_id: question.id, value: value })
      }
    }
  })

  return formattedInput
}
