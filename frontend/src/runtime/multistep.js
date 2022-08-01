function goToPage(currentPage, targetPage) {
  currentPage = parseInt(currentPage)
  targetPage = parseInt(targetPage)

  document
    .getElementsByClassName(`formPage-${currentPage}`)[0]
    .classList.add('form-hidden')

  document
    .getElementsByClassName(`formPage-${targetPage}`)[0]
    .classList.remove('form-hidden')

  window.scrollTo(0, 0)
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
  const currentPage = element.dataset.currentpage

  if (element.classList.contains('pb-next')) {
    element.addEventListener('click', (event) => {
      if (checkFormPageGoodToGo(currentPage)) {
        goToPage(currentPage, parseInt(currentPage) + 1)
      }
    })
  }

  if (element.classList.contains('pb-previous')) {
    element.addEventListener('click', (event) => {
      if (checkFormPageGoodToGo(currentPage)) {
        goToPage(currentPage, parseInt(currentPage) - 1)
      }
    })
  }
}

const pageSelectors = document.getElementsByClassName(
  'currentPageSelector-select'
)
for (const pageSelector of pageSelectors) {
  pageSelector.addEventListener('change', (event) => {
    const currentPage = pageSelector.dataset.currentpage
    const targetPage = event.target.value
    if (targetPage !== currentPage && checkFormPageGoodToGo(currentPage)) {
      pageSelector.value = currentPage
      goToPage(currentPage, targetPage)
    } else {
      pageSelector.value = currentPage
    }
  })
}
