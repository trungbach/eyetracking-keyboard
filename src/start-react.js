const net = require('net')
const childProcess = require('child_process')

const port = 3000
const client = new net.Socket()

let startedElectron = false
const tryConnection = () => {
  client.connect({ port }, () => {
    client.end()
    if (!startedElectron) {
      console.log('starting electron')
      startedElectron = true
      const exec = childProcess.execSync
      let proc = exec('npm run electron')

      // Register IPC hooks.
      require('./ipc/eyetracking');
      require('./ipc/calibrate');
      proc.stdout.on('data', data=> {
        console.log(data);
      })
    }
  })
}

tryConnection()

client.on('error', () => {
  setTimeout(tryConnection, 1000)
})

