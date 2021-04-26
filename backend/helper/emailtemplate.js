const { FP_ENV, FP_HOST } = process.env
const devPort = 3000
const FRONTEND = FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST

exports.htmlAnswers = (form, formattedInput, submission_id) => {
  let questionData = []
  for (const data of formattedInput) {
    const question_id = parseInt(data.q_id)
    const value = data.value
    const checkQuestion = form.props.elements.filter(
      (element) => element.id === question_id
    )
    const question = checkQuestion[0].label
    const type = checkQuestion[0].type

    questionData.push({
      question: question,
      type: type,
      answer: value,
      question_id: question_id
    })
  }
  const responses = questionData.map((data) => {
    let answer = ''
    const question =
      '<div style=" color: #113952; font-weight: bold; font-size: 16px; width: 100%; padding: 10px 10px 10px 30px;">' +
      data.question +
      '</div>'
    if (data.type === 'Name') {
      answer =
        '<div style=" width: 100%; color: #113952; font-size: 16px; padding: 10px 10px 10px 30px;"><i>First Name: </i>' +
        data.answer.firstName +
        '</div><div style=" width: 100%; color: #113952; font-size: 16px; padding: 10px 10px 10px 30px;"><i>Last Name: </i>' +
        data.answer.lastName +
        '</div>'
    } else if (data.type === 'Checkbox' && data.answer === 'off') {
      answer =
        '<div style=" width: 100%; color: #113952; font-size: 16px; padding: 10px 10px 10px 30px;">' +
        'Unchecked' +
        '</div>'
    } else if (data.type === 'FileUpload') {
      const value = JSON.parse(data.answer)
      const uriFileName = encodeURI(value.fileName)
      const downloadLink = `${FRONTEND}/download/${form.id}/${submission_id}/${data.question_id}/${uriFileName}`

      answer =
        '<div style=" width: 100%; color: #113952; font-size: 16px; padding: 10px 10px 10px 30px;">' +
        '<a href="' +
        downloadLink +
        '" target="_blank">' +
        value.fileName +
        '</a>'
      ;('</div>')
    } else {
      answer =
        '<div style=" width: 100%; color: #113952; font-size: 16px; padding: 10px 10px 10px 30px;">' +
        data.answer +
        '</div>'
    }

    return question + answer
  })
  const answers =
    '<div style= " padding: 10px;">' +
    responses.join('</div><div style= " padding: 10px;">') +
    '</div>'

  return answers
}

exports.textEmail = (form, formattedInput, submission_id) => {
  let textedEmail = ''
  let questionData = []

  for (const data of formattedInput) {
    const question_id = parseInt(data.q_id)
    const value = data.value
    const checkQuestion = form.props.elements.filter(
      (element) => element.id === question_id
    )
    const question = checkQuestion[0].label
    const type = checkQuestion[0].type

    questionData.push({ question: question, type: type, answer: value })
  }
  const formName = form.title
  const formpressText = 'FORMPRESS Open Source Data Collection\r\n\r\n'
  const helloText =
    'Your "' +
    formName +
    '" form just received a respond. Here is the details:\r\n\r\n'
  const responses = questionData.map((data) => {
    let answer = ''
    const question = data.question + '\r\n'
    if (data.type === 'Name') {
      answer =
        'First Name: ' +
        data.answer.firstName +
        '\r\nLast Name: ' +
        data.answer.lastName +
        '\r\n'
    } else if (data.type === 'Checkbox' && data.answer === 'off') {
      answer = 'Unchecked' + '\r\n'
    } else if (data.type === 'FileUpload') {
      const value = JSON.parse(data.answer)
      const uriFileName = encodeURI(value.fileName)
      const downloadLink = `${FRONTEND}/download/${form.id}/${submission_id}/${data.question_id}/${uriFileName}`

      answer =
        value.fileName +
        '\r\n' +
        ' (To download file visit ' +
        downloadLink +
        ')\r\n'
    } else {
      answer = data.answer + '\r\n'
    }

    return question + answer
  })
  const answers = responses.join('\r\n')
  let emailAddress = ''
  const integrations = form.props.integrations || []
  const emailIntegration = integrations.filter(
    (integration) => integration.type === 'email'
  )
  emailAddress = emailIntegration[0].to
  const footer =
    '\r\n\r\n\r\n2021 FORMPRESS This e-mail has been sent to ' +
    emailAddress +
    ', you can change it from form properties.'
  textedEmail += formpressText
  textedEmail += helloText
  textedEmail += answers
  textedEmail += footer

  return textedEmail
}
