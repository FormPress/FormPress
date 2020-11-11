const { exec } = require('child_process')

module.exports = (cmd, stream = false) =>
  new Promise((resolve, reject) => {
    const pro = exec(cmd, (err, stdout) =>
      err !== null ? reject(err) : resolve(stdout)
    )

    if (stream === true) {
      pro.stdout.on('data', console.log.bind(console))
    }
  })
