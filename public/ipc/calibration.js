const { ipcMain } = require('electron');
const { fork } = require('child_process');
const path = require('path');

const Calibrate = require('./Calibrate');

const PROCESS_NAME = 'calibrate-child.js';

// Call this func when user want to recalibrate
ipcMain.on("CALIBRATE_TOBII_EYETRACKER", (event, arg) => {
    Calibrate.calibrate();
});

let eyetrackingProcess;
ipcMain.on("CALIBRATE_TOBII_WHEN_IDLE", (event, arg) => {
    
    // Check if there is a currently running eyetracking process
    // if so, kill it
    if (eyetrackingProcess) {
        console.log(`Killing ${PROCESS_NAME} process (${eyetrackingProcess.pid || 'no pid found'})`);
        eyetrackingProcess.kill('SIGINT');
    }

    // fork a child process to run the eyetracking module
    eyetrackingProcess = fork(path.join(__dirname, PROCESS_NAME), [], {
        stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    console.log(`Forking ${PROCESS_NAME} process (${eyetrackingProcess.pid || 'no pid found'})`);
    console.log(`pid (${eyetrackingProcess.pid}): width = ${arg.width} height = ${arg.height}`);

    // Send the screen metadata to start the listen loop.
    eyetrackingProcess.send(arg);

    // When the forked process emits a message, push to the render process
    eyetrackingProcess.on('message', (evt) => {
        Calibrate.calibrate();
    });
});