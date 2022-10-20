const path = require('path')
const { spawn } = require('child_process')

async function runPupeteer(data) {
  let stdoutData = ''
  return await new Promise((resolve) => {
    const proc = spawn(
      'node',
      [
        path.resolve(__dirname, 'puppeteerWorker.js'),
        `--input-data${data}`,
        '--tagprocess'
      ],
      { shell: false }
    )
    proc.stdout.on('data', (data) => {
      stdoutData += data
    })
    proc.stderr.on('data', (data) => {
      console.error(`NodeERR: ${data}`)
    })
    proc.on('close', async () => {})
    proc.on('exit', function () {
      proc.kill()
      resolve(JSON.parse(stdoutData))
    })
  })
}

exports.generatePDF = async (htmlPath) => {
  const resData = await runPupeteer(htmlPath)

  if (resData.pdfBuffer) {
    return resData.pdfBuffer
  } else {
    return false
  }
}
