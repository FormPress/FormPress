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

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36 WAIT_UNTIL=load'
  )
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
