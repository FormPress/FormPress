const reactDOMServer = require('react-dom/server')

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
      let value = Elements[question.type].submissionHandler.findQuestionValue(
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

exports.getQuestionsWithRenderedAnswers = (
  form,
  formattedInput,
  submission_id
) => {
  let questionData = []
  for (const input of formattedInput) {
    const question_id = parseInt(input.q_id)
    const { value } = input
    // necessary for FileUpload
    input.submission_id = submission_id
    const element = form.props.elements.find(
      (element) => element.id === question_id
    )

    let plainAnswer, renderedAnswer

    if (typeof Elements[element.type].renderDataValue === 'function') {
      renderedAnswer = Elements[element.type].renderDataValue(input, element)
      renderedAnswer = reactDOMServer.renderToStaticMarkup(renderedAnswer)
    }

    plainAnswer = value ? value : '-'

    questionData.push({
      question: element.label,
      type: element.type,
      answer: plainAnswer,
      renderedAnswer,
      id: question_id
    })
  }

  return questionData
}
