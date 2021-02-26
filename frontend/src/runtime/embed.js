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
  let BACKEND = false

  const loadScript = (name) =>
    new Promise((resolve, reject) => {
      const script = document.createElement('script')

      script.onload = resolve
      script.src = `${BACKEND}/runtime/${name}.js`
      document.head.appendChild(script)
    })

  // fill BACKEND variable,

  await loadScript('3rdparty/jquery.3.4.1.min')

  console.log(jQuery('script a'))
})()
