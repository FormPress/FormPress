const heroImage = 'https://static.formpress.org/images/hero.png'
const formpressLogo = 'https://static.formpress.org/images/logo.png'
const mottoText = 'https://static.formpress.org/images/motto.png'
const { FP_ENV, FP_HOST } = process.env
const devPort = 3000
const FRONTEND = FP_ENV === 'development' ? `${FP_HOST}:${devPort}` : FP_HOST

exports.htmlEmail = (form, formattedInput, submission_id) => {
  let styledEmail = '<div style=" width: 600px; border:solid 1px #e2e2e2;">'
  const formName = form.title
  const topBar =
    '<div style=" background-color:#8cc63f; width:100%; height: 6px"></div><div style= "height:80px; width:100%;"><span style=" padding: 10px 10px 10px 40px; display: inline-block"><img src="' +
    formpressLogo +
    '" alt="formpress logo" width="204"/></span><span style="padding: 10px 10px 10px 110px;"><img src="' +
    mottoText +
    '" alt="formpress motto" width="206"/></span></div>'
  const helloText =
    '<div style=" width: 100% padding-bottom:50px;"><span style=" padding: 80px 80px 10px 40px; width: 43%; font-size: 16px; color:#113952; float:left;">Your <strong>&quot;' +
    formName +
    '&quot;</strong> form just received a respond. Here is the details:</span><span><img src="' +
    heroImage +
    '" alt="submisssion success" width="221"/></span></div>'
  const someLine =
    '<div><span style="width: 40px; display: inline-block"></span><span style="width: 85%; display: inline-block; height: 2px; background-color: #e2e2e2;"></span></div>'
  const respondHead =
    '<div style=" color:#7aad37; font-size: 18px; padding-left:40px; padding-top: 20px;">RESPONDS</div>'

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
  let emailAddress = ''
  const integrations = form.props.integrations || []
  const emailIntegration = integrations.filter(
    (integration) => integration.type === 'email'
  )
  emailAddress = emailIntegration[0].to

  const footer =
    '<div style =" font-size: 12px;   text-align: center; color: #646569;">&#169; 2021 FORMPRESS.ORG This e-mail has been sent to ' +
    emailAddress +
    ', you can change it from form properties.</div></div>'
  styledEmail += topBar
  styledEmail += helloText
  styledEmail += someLine
  styledEmail += respondHead
  styledEmail += answers
  styledEmail += footer
  return styledEmail
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
