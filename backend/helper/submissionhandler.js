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
  submission_id,
  htmlRendering = false
) => {
  let questionData = []
  for (const input of formattedInput) {
    let question_id = parseInt(input.q_id) //

    // if question_id is NaN, check for input.question_id to handle data both from db and from submission event
    if (isNaN(question_id) && input.question_id !== undefined) {
      question_id = parseInt(input.question_id)
    }

    // necessary for FileUpload
    input.submission_id = submission_id
    const element = form.props.elements.find(
      (element) => element.id === question_id
    )

    let plainAnswer, renderedAnswer

    if (typeof Elements[element.type].getPlainStringValue === 'function') {
      try {
        plainAnswer = Elements[element.type].getPlainStringValue(input, element)
      } catch (e) {
        plainAnswer = 'Error retrieving answer.'
      }
    }

    if (htmlRendering) {
      if (typeof Elements[element.type].renderDataValue === 'function') {
        try {
          renderedAnswer = Elements[element.type].renderDataValue(
            input,
            element
          )
          renderedAnswer = reactDOMServer.renderToStaticMarkup(renderedAnswer)
        } catch (e) {
          renderedAnswer = 'Error rendering answer.'
        }
      }
    }

    questionData.push({
      question: element.label,
      type: element.type,
      answer: plainAnswer,
      renderedAnswer: renderedAnswer,
      id: question_id
    })
  }

  return questionData
}
