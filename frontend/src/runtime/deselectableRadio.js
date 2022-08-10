;(async () => {
  var isInternetExplorer =
    navigator.userAgent.indexOf('MSIE') !== -1 ||
    navigator.appVersion.indexOf('Trident/') > 0

  if (isInternetExplorer === false) {
    var mainStyleElem = document.getElementsByTagName('style')[0]
    mainStyleElem.innerHTML += ' .radioList > li > * { pointer-events: none; } '
  }

  var radioLists = document.getElementsByClassName('radioList')

  for (var i = 0; i < radioLists.length; i++) {
    radioLists[i].addEventListener('click', function (e) {
      if (e.target.tagName === 'LI') {
        e.preventDefault()
        e.stopPropagation()

        var radioInput = e.target.getElementsByTagName('input')[0]
        radioInput.checked = !radioInput.checked
      }
    })
  }
})()
