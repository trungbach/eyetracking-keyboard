const net = require('net')
const childProcess = require('child_process')

const port = 3000
const client = new net.Socket()

let startedElectron = false
const tryConnection = () => {
  client.connect({ port }, () => {
    client.end()
    console.log('startedElectron', startedElectron)
    if (!startedElectron) {
      console.log('starting electron')
      startedElectron = true
      // const exec = childProcess.execSync
      const exec = childProcess.execSync
      let proc = exec('npm run electron')
      // Register IPC hooks.
      require('./ipc/eyetracking');
      require('./ipc/calibrate');

      // proc.stdout.on('data', data=> {
      //   console.log(
      //     'data', data
      //   )
      //   console.log('data', data);
        
      // })
    }
  })
}

tryConnection()
 
console.log('ok 1')
// require('./ipc/eyetracking');
// require('./ipc/calibrate');
console.log('ok 2')

// client.on('connection', (stream) => {
//   console.log('someone connected!');
// });
client.on('ready', () => {
  console.log(
    'ready'
  )
   require('./ipc/eyetracking');
      require('./ipc/calibrate');
})
client.on('error', () => {
  setTimeout(tryConnection, 1000)
})

