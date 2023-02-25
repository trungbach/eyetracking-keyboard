import React from 'react';

import "../styles/TextToSpeech.css";

/**
 * On click, say the string stored in string
 * @param {string} string 
 */
const TextToSpeech = ({string}) => {
    const onSpeakButtonClick = () => {
        if (!string || string.length === 0)
            return;
        
        let utterance = new SpeechSynthesisUtterance(string);
        speechSynthesis.speak(utterance);
    }

    return (
        <div onClick={onSpeakButtonClick} className={"speak"}>
            Speak
        </div>
    );
};

export default TextToSpeech;