;(async () => {
  document.querySelectorAll('input[type=radio]').forEach(function (element) {
    element.disabled = true
  })
  const formIsEmbedded = window.location !== window.parent.location

  const loadScript = (name) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.onload = resolve
      script.src = `${BACKEND}/runtime/${name}.js`
      document.head.appendChild(script)
    })

  if (formIsEmbedded) {
    await loadScript('3rdparty/iframeSizer.contentWindow.min')
  }

  let emptyAnswers = 0
  let correctAnswers = 0
  let wrongAnswers = 0
  const questionCount = QUESTIONS.length

  FORMPRESS.ANSWERS.forEach((elem) => {
    const question = FORMPRESS.QUESTIONS.find(
      (question) => question.id === elem.question_id
    )
    const questionContainer = document.getElementById(`qc_${question.id}`)
    const choices = questionContainer.getElementsByTagName('li')

    const answer = elem.value.find((answer) => answer.value === 'checked')
    let answerIsWrong = false

    if (answer) {
      const answerIndex = elem.value.indexOf(answer)
      const answerInput = document.getElementById(
        `q_${question.id}_${answerIndex}`
      )
      answerInput.checked = true

      if (question.expectedAnswer !== '') {
        const expectedAnswerIndex = parseInt(question.expectedAnswer)
        answerIsWrong = expectedAnswerIndex !== answerIndex

        if (answerIsWrong) {
          wrongAnswers++
          choices[expectedAnswerIndex].classList.add('expected')
          choices[answerIndex].classList.add('wrong')
        } else {
          correctAnswers++
          choices[expectedAnswerIndex].classList.add('correct')
        }
      }
    } else {
      emptyAnswers++
      if (question.expectedAnswer !== '') {
        const expectedAnswerIndex = parseInt(question.expectedAnswer)
        choices[expectedAnswerIndex].classList.add('expected')
      }
    }

    // the part below is for populating the textarea with the answer
    if (question.answerLabelText) {
      const answerLabel = document.getElementById(
        `q_${question.id}_answerLabel`
      )
      answerLabel.innerHTML = question.answerLabelText
    }

    if (question.answerExplanation) {
      const answerExplanation = document.getElementById(
        `q_${question.id}_answerExplanation`
      )
      answerExplanation.innerHTML = question.answerExplanation
      answerExplanation.classList.remove('dn')
    }
    // details element of the question
    questionContainer.getElementsByTagName('details')[0].open = answerIsWrong
  })

  function colorizePercentage(percent) {
    var a = percent / 100,
      b = 120 * a
    // Return a CSS HSL string
    return 'hsl(' + b + ', 100%, 50%)'
  }

  const percentageScore = Math.floor((correctAnswers / questionCount) * 100)

  document.querySelectorAll('.answerExplanation').forEach(function (element) {
    element.classList.remove('dn')
  })

  document.getElementById('questionCount').innerText = `${questionCount}`
  document.getElementById('correctAnswers').innerText = `${correctAnswers}`
  document.getElementById('wrongAnswers').innerText = `${wrongAnswers}`
  document.getElementById('unanswered').innerText = `${emptyAnswers}`

  const percentageScoreDOMElem = document.getElementById('percentageScore')
  percentageScoreDOMElem.innerHTML = `${percentageScore}`
  percentageScoreDOMElem.style.color = colorizePercentage(percentageScore)

  if (formIsEmbedded) {
    window.parent.postMessage(
      {
        type: 'submission-info',
        formId: FORMPRESS.formId,
        submissionId: FORMPRESS.submissionId,
        results: {
          questionCount: questionCount,
          answersGiven: correctAnswers + wrongAnswers,
          correctAnswers: correctAnswers,
          wrongAnswers: wrongAnswers,
          percentageScore: percentageScore
        }
      },
      '*'
    )
  }
})()
