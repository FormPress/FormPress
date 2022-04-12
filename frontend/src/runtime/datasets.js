;(async () => {
  const requiredDatasets = []

  const elemsWithDatalist = document.querySelectorAll('[data-fp-list]')

  if (elemsWithDatalist.length === 0) {
    return
  }

  for (const element of elemsWithDatalist) {
    if (!requiredDatasets.includes(element.dataset.fpList)) {
      requiredDatasets.push(element.dataset.fpList)
    }
  }

  const script = document.createElement('script')
  script.src = `${BACKEND}/api/datasets?dataset=${requiredDatasets
    .sort()
    .join(',')}&callback=processJSONP`
  script.async = true
  document.body.appendChild(script)

  const fillDatasets = (element, dataset) => {
    dataset.forEach((option) => {
      const optionElement = document.createElement('option')
      optionElement.value = option
      optionElement.innerText = option
      element.appendChild(optionElement)
    })
  }

  window.processJSONP = (response) => {
    elemsWithDatalist.forEach((element) => {
      const dataset = response[element.dataset.fpList]
      fillDatasets(element, dataset)
    })
  }
})()
