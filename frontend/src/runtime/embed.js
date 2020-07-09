(async () => {
  const loadScript = (name) => new Promise((resolve, reject) => {
    const script = document.createElement('script')

    script.onload = resolve
    script.src = `${BACKEND}/runtime/${name}.js`
    document.head.appendChild(script)
  })


  await loadScript(`${BACKEND}/runtime/3rdparty/`)

  console.log(jQuery('script'))
})()