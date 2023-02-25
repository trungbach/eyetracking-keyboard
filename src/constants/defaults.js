/**
 * This file exports default settings in the keyboard component such 
 * as dwell time, focus, and the potentially more.
 */

module.exports = {
    // dwell time configuration in MS
    DEFAULT_DWELL_TIME_OPTIONS_MS: [0, 250, 500, 750, 1000],

    // Index of default dwell time.
    DEFAULT_DWELL_TIME_MS: 750,

    // By default whether to listen for gaze data.
    DEFAULT_EYETRACKING_ON: false,

    DEFAULT_WORD_SUGGESTIONS: [
        { word: 'hello', score: 0 },
        { word: 'world', score: 0 },
        { word: 'Trung', score: 0 },
    ],

    DEFAULT_TOBII_EXPERIENCE_PATH: "C:\\Program Files\\Tobii",

    DEFAULT_RECALIBRATE_TIMER: 30000,

    DEFUALT_LAYOUT_STARTUP: "default",

    DEFAULT_LAYOUTS: new Proxy({
        // 'default': [
        //     '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
        //     '{tab} q w e r t y u i o p [ ] \\',
        //     '{lock} a s d f g h j k l ; \' {enter}',
        //     '{shift} z x c v b n m , . / {shift}',
        //     '.com @ {space}'
        // ],
        'default': [
            '1 2 3 4 5 6 7 8 9 0 {bksp}',
            'q w e r t y u i o p',
            'a s d f g h j k l',
            'z x c v b n m {enter}',
            '{space}'
        ],
    }, {}
    ),
}