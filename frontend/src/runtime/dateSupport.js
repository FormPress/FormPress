function loadAssets(urls, callback) {
  var head = document.getElementsByTagName('head')[0]
  var loaded = 0
  var isAllLoaded = function () {
    loaded++
    if (loaded === urls.length) {
      callback()
    }
  }
  urls.forEach(function (url) {
    if (url.endsWith('.js')) {
      var script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = url
      script.onload = isAllLoaded
      head.appendChild(script)
    } else if (url.endsWith('.css')) {
      var link = document.createElement('link')
      link.rel = 'stylesheet'
      link.type = 'text/css'
      link.href = url
      link.onload = isAllLoaded
      head.appendChild(link)
    }
  })
}

loadAssets(
  [
    'https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css',
    'https://cdn.jsdelivr.net/npm/flatpickr@4.6.3/dist/flatpickr.min.js'
  ],
  function () {
    var flatpickrElements = document.querySelectorAll(
      '.elementDatePicker input[type="text"]'
    )

    if (flatpickrElements.length > 0) {
      for (var i = 0; i < flatpickrElements.length; i++) {
        flatpickrElements[i].flatpickr(
          JSON.parse(flatpickrElements[i].getAttribute('flatpickrOptions'))
        )
      }
    }
  }
)
