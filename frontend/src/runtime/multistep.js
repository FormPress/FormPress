function navigateToNextPage(currentPage, direction) {
  const nextPage = parseInt(currentPage) + 1
  const previousPage = parseInt(currentPage) - 1

  switch (direction) {
    case 'next':
      document
        .getElementsByClassName(`formPage-${currentPage}`)[0]
        .classList.add('form-hidden')
      document
        .getElementsByClassName(`formPage-${nextPage}`)[0]
        .classList.remove('form-hidden')
      break
    case 'previous':
      document
        .getElementsByClassName(`formPage-${currentPage}`)[0]
        .classList.add('form-hidden')
      document
        .getElementsByClassName(`formPage-${previousPage}`)[0]
        .classList.remove('form-hidden')
      break
    default:
      break
  }
}

function checkFormPageGoodToGo(currentPage) {
  let thisPageRequiredGoodToGo = true
  let thisPageValidGoodToGo = true
  let firstRequiredError
  let firstInvalidError

  if (FORMPRESS.requireds !== undefined) {
    const thisPageRequireds = Object.keys(FORMPRESS.requireds)

    for (const key of thisPageRequireds) {
      const requiredElem = FORMPRESS.requireds[key]

      if (requiredElem.valid === false && requiredElem.page === currentPage) {
        thisPageRequiredGoodToGo = false
        document
          .getElementById(`qc_${requiredElem.id}`)
          .classList.add('requiredError')
      }
    }

    if (thisPageRequiredGoodToGo === false) {
      const firstRequiredError = document.querySelector(`.requiredError`)

      if (firstRequiredError) {
        firstRequiredError.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }

  if (FORMPRESS.valids !== undefined) {
    const thisPageValids = Object.keys(FORMPRESS.valids)

    for (const key of thisPageValids) {
      const invalidElem = FORMPRESS.valids[key]

      if (invalidElem.valid === false && invalidElem.page === currentPage) {
        thisPageValidGoodToGo = false
        document
          .getElementById(`qc_${invalidElem.id}`)
          .classList.add('invalidError')
      }
    }

    if (thisPageValidGoodToGo === false) {
      firstInvalidError = document.querySelector(`.invalidError`)

      if (firstInvalidError && !firstRequiredError) {
        // required errors have the priority
        firstInvalidError.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  }

  return thisPageRequiredGoodToGo && thisPageValidGoodToGo
}

// get all elements with data-currentpage attribute
const elementsWithCurrentPage = document.querySelectorAll(`[data-currentpage]`)

for (const element of elementsWithCurrentPage) {
  element.addEventListener('click', (event) => {
    const currentPage = event.target.dataset.currentpage

    if (event.target.classList.contains('pb-next')) {
      if (checkFormPageGoodToGo(currentPage)) {
        navigateToNextPage(currentPage, 'next')
      }
    } else if (event.target.classList.contains('pb-previous')) {
      navigateToNextPage(currentPage, 'previous')
    }
  })
}
