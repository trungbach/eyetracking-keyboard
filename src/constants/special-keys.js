/**
 * This file exports special key bindings for the virtual keyboard,
 * for example, if the user selects {space}, we don't want to insert the literal
 * string "{space}", we wan't to capture " ".
 */

class SpecialKey {
    constructor(id, update) {
        this.id = id;
        this.update = update;
    }
}

const space = new SpecialKey("{space}", input => input + " ");
const enter = new SpecialKey("{enter}", input => input + "\n");
const backspace = new SpecialKey("{bksp}", input => input.slice(0, -1));

// module.exports = {
//     "": space,
//     "< enter": enter,
//     "backspace": backspace,
// }

const specialKeys = {
    "": space,
    "< enter": enter,
    "backspace": backspace,
}

export default specialKeys;