const Elements = require('../script/transformed/elements/')
const moment = require('moment')

exports.replaceWithAnswers = (str, questionsAndAnswers) => {
  const curlyBraceRegex = /(?:{[^{]*?)\w(?=})}/gim

  const submissionDate =
    moment(new Date()).utc().format('YYYY-MM-DD HH:mm:ss') + ' UTC'

  let string = str
  let curlyBraceMatches = string.match(curlyBraceRegex)
  if (curlyBraceMatches !== null) {
    curlyBraceMatches.forEach((match) => {
      let matchingVariable = match.replace('{', '').replace('}', '')

      if (matchingVariable === 'submissionDate') {
        string = string.replace(match, submissionDate)
      } else {
        // then it is a question
        let splitVariable = matchingVariable.split('_')

        if (splitVariable.length !== 2) {
          return
        }

        let questionType = splitVariable[0]
        let questionId = splitVariable[1]

        let validFormatting = false

        if (
          Elements[questionType] !== undefined &&
          typeof parseInt(questionId) === 'number'
        ) {
          validFormatting = true
        }

        if (!validFormatting) {
          return
        }

        const question = questionsAndAnswers.find(
          (q) => q.type === questionType && q.id === parseInt(questionId)
        )

        if (question !== undefined) {
          let answer = question.answer

          if (questionType === 'FileUpload') {
            answer.split('/').pop()
          }

          string = string.replace(match, question.answer)
        }
      }
    })
  }

  return string
}
