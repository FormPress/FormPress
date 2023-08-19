;(async () => {
  function promptOnSuccess(position, questionContainer) {
    const latInput = questionContainer.querySelector(
      `input[data-coordinatetype="latitude"]`
    )
    const longInput = questionContainer.querySelector(
      `input[data-coordinatetype="longitude"]`
    )

    const mapIframe = questionContainer.querySelector(`iframe`)
    // apikey is located in iframe data-apiKey attribute
    const apiKey = mapIframe.getAttribute(`data-apikey`)
    const mapUrl = `
    https://www.google.com/maps/embed/v1/place?q=${position.coords.latitude},${position.coords.longitude}&key=${apiKey}
    `

    mapIframe.setAttribute(`src`, mapUrl)

    latInput.value = position.coords.latitude
    longInput.value = position.coords.longitude

    const responseDiv = questionContainer.querySelector(`.response-status`)
    responseDiv.classList.add(`success`)
    responseDiv.innerHTML = `Location successfully filled in.`
    responseDiv.classList.remove(`dn`)
    mapIframe.classList.remove(`dn`)
  }

  function promptOnError(error, questionContainer) {
    let errorMessage = ''

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'User denied the request for Geolocation.'
        break
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information is unavailable.'
        break
      case error.TIMEOUT:
        errorMessage = 'The request to get user location timed out.'
        break
      case error.UNKNOWN_ERROR:
        errorMessage = 'An unknown error occurred.'
        break
    }

    const responseDiv = questionContainer.querySelector(`.response-status`)
    responseDiv.classList.add(`error`)
    responseDiv.innerHTML = errorMessage
    responseDiv.classList.remove(`dn`)
  }

  function onLocationButtonClick(event) {
    const button = event.target
    const locationElement = button.closest(`.elementLocation`)
    const responseDiv = locationElement.querySelector(`.response-status`)
    // remove all classes from responseDiv other than .response-status and .dn
    responseDiv.className = `response-status dn`

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        // success callback
        (position) => {
          promptOnSuccess(position, locationElement)
        },
        // error callback
        (error) => {
          promptOnError(error, locationElement)
        }
      )
    } else {
      responseDiv.classList.add(`error`)
      responseDiv.innerHTML = `Geolocation is not supported by this browser.`
      responseDiv.classList.remove(`dn`)
    }
  }

  const locationElements = document.querySelectorAll(`.elementLocation`)

  for (const locationElement of locationElements) {
    const button = locationElement.querySelector(`button`)
    button.addEventListener(`click`, onLocationButtonClick)
  }
})()
