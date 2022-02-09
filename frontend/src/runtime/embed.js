/*
  Embed should work by this
  <div>
    <script src="http://localhost:3001/runtime/embed.js" FP_ID="7"></script>
  </div>

  => 

  <div>
    <script src="http://localhost:3001/runtime/embed.js" FP_ID="7"></script>
    <iframe src="http://localhost:3001/form/view/7"/>
  </div>
  
  1. DON't depend on BACKEND, parse it from src part of script tags who has FP_ID attribute defined

  2. traverse FP_ID defined script tags, and insert iframe form view just as sibling


*/

;(async () => {
  const scriptUrl = document.querySelectorAll('[fp_id]')[0].src
  const arr = scriptUrl.split('/')
  const BACKEND = arr[0] + '//' + arr[2]

  const loadScript = (name) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.onload = resolve
      script.src = `${BACKEND}/runtime/${name}.js`
      document.head.appendChild(script)
    })

  await loadScript('3rdparty/jquery.3.4.1.min')
  await loadScript('3rdparty/iframeResizer.min')
  // console.log(jQuery('script a'))

  // add iframe after script tag, adding after not fp_style to ignore multiple embed
  $('script[fp_id]').each(function (index) {
    if (!$(this).next().attr('fp_style')) {
      const formID = $(this).attr('fp_id')
      const iframeID = 'fp_' + formID

      $(`<style fp_style="true">
        iframe {
          width: 1px;
          min-width: 100%;
          border: none;
          }
      </style>
      <iframe id="${iframeID}" src="${BACKEND}/form/view/${formID}?embed=true"></iframe>
      <script>
        iFrameResize({ log: false }, '#${iframeID}')
      </script>`).insertAfter(this)
    }
  })
})()
