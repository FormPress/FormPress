;(async () => {
  const puppeteer = require('puppeteer')

  let pdfBuffer

  const inputFile = process.argv
    .find((a) => a.startsWith('--input-data'))
    .replace('--input-data', '')

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })
  const page = await browser.newPage()

  //wait for 5 seconds just to make sure bucket is ready to serve images
  await new Promise((resolve) => setTimeout(resolve, 5000))

  await page.goto(`file:///${inputFile}`, { waitUntil: 'networkidle0' })

  await page.emulateMediaType('print')

  pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true
  })

  const outputData = {
    pdfBuffer: pdfBuffer
  }

  await page.close()
  await browser.close()

  console.log(JSON.stringify(outputData))
})()
