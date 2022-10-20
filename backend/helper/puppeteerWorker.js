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

  await page.setContent(inputFile, {
    waitUntil: 'domcontentloaded'
  })

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
