const fs = require('fs');
const { exec } = require("child_process");

class Calibrate {
    static calibrate(basePath) {
        let base = "C:\\Program Files\\Tobii";
        if (!fs.existsSync(base)) {
            throw new Error(`${this.base} can't be found, do you have Tobii Experience installed?`);
        }

        let path = `${base}\\Tobii EyeX\\Tobii.Configuration.exe`;
        if (!fs.existsSync(path)) {
            throw new Error(`${path} can't be found. Not able to calibrate.`);
        }

        let command = `"${path}" -Q`;
        exec(command, (error, stdout, stderr) => {
            if (error)
                console.log(error.message)
            else
                console.log(`Calibrate successful!`);
        });
    };
}
module.exports = Calibrate;