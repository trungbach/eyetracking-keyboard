const { ipcMain } = require('electron');
const { fork } = require('child_process');
const path = require('path');
const PROCESS_NAME = 'eyetracking-child.js';

/**
 * TODO: Put this in its own file in /ipc/
 * Kicks off the tobii.listen() loop.
 * 
 * Each time the eyetracking recognizes a new focus event,
 * the metadata of said event to emitted to the renderer process
 * using a event.reply() call. 
 */
let eyetrackingProcess;
ipcMain.on("ASYNC_LISTEN", (event, arg) => {

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
    console.log(`pid (${eyetrackingProcess.pid}): width = ${arg.width} height = ${arg.height} rectangles = ${arg.rectangles.length}`);

    // Send the screen metadata to start the listen loop.
    eyetrackingProcess.send(arg);

    // When the forked process emits a message, push to the render process
    eyetrackingProcess.on('message', (evt) => {
        let payload = {
            ...evt,
            ...arg.rectangles[evt.id]
        };

        event.reply('ASYNC_GAZE_FOCUS_EVENT', payload);
    });
});