;(async () => {
  const requiredDatasets = []

  const elemsWithDatalist = document.querySelectorAll('[data-fp-list]')

  const hasFlags =
    document.querySelector('[data-fp-list=countriesWithFlags]') ||
    document.querySelector('[data-fp-list=countriesDialCodes]')

  if (hasFlags) {
    const isWindows = window.userAgent.indexOf('windows') > -1
    if (isWindows) {
      let fontName = 'Twemoji Country Flags'
      let fontUrl =
        'https://cdn.jsdelivr.net/npm/country-flag-emoji-polyfill@0.1/dist/TwemojiCountryFlags.woff2'

      const style = document.createElement('style')
      style.textContent = `@font-face {
      font-family: "${fontName}";
      unicode-range: U+1F1E6-1F1FF, U+1F3F4, U+E0062-E0063, U+E0065, U+E0067,
        U+E006C, U+E006E, U+E0073-E0074, U+E0077, U+E007F;
      src: url('${fontUrl}') format('woff2');
    }`
      document.head.appendChild(style)
    }
  }

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
      optionElement.value = option.value
      optionElement.innerText = option.display
      element.appendChild(optionElement)
    })
  }

  window.processJSONP = (response) => {
    elemsWithDatalist.forEach((element) => {
      const dataset = response[element.dataset.fpList]
      fillDatasets(element, dataset)
    })

    //if they have default values it should be set
    const elemsWithDefaultValue = document.querySelectorAll(
      '[data-fp-defaultvalue]'
    )

    if (elemsWithDefaultValue) {
      for (const elem of elemsWithDefaultValue) {
        elem.value = elem.dataset.fpDefaultvalue
      }
    }
  }
})()
