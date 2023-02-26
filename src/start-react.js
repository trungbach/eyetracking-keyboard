const net = require('net')
const childProcess = require('child_process')

const port = 3000
const client = new net.Socket()

let startedElectron = false
const tryConnection = () => {
  client.connect({port},  () => {
    client.end()
    if (!startedElectron) {
      console.log('starting electron')
      startedElectron = true
      const exec = childProcess.exec
      let proc = exec('npm run electron')
      proc.stdout.on('data', data=> {
        console.log('data', data);
      })
    }
  })
}

tryConnection()

client.on('error', () => {
  setTimeout(tryConnection, 1000)
})





