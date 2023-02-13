import React, { useEffect, useRef, useState } from 'react';
import Keyboard from 'react-simple-keyboard';
import Toggle from 'react-toggle';
import Calibrate from './Calibrate';
import SelectLayout from './SelectLayout';
import SliderWrapper from './SliderWrapper';
import WordSuggestions from './WordSuggestions';

import 'react-simple-keyboard/build/css/index.css';
import 'react-toggle/style.css';

import "../styles/KeyboardWrapper.css";

import {
  defaults, events, 
  // specialkeys,
  types
} from "../constants/index";
import TobiiRegion from '../util/TobiiRegion'
const { ipcRenderer } = window.require("electron");

const KeyboardWrapper = () => {
  const [input, setInput] = useState("");
  const [layout, setLayout] = useState(defaults.DEFUALT_LAYOUT_STARTUP);
  const [dwellTimeMS, setDwellTimeMS] = useState(defaults.DEFAULT_DWELL_TIME_MS);
  const [eyetrackingIsOn, setEyetrackingIsOn] = useState(defaults.DEFAULT_EYETRACKING_ON);
  const [gazeLog, setGazeLog] = useState({});

  const keyboard = useRef();
  const suggestions = useRef();

 /**
    * Nhận metadata về màn hình và bàn phím, đồng thời đẩy thông tin đã nói tới
    * mô-đun eyetracking thông qua ipc.
    *
    * Bắt đầu vòng lặp listen eyetracking.
    *
    * Trên mỗi event focus vào ánh nhìn, gọi onGazeFocusEvent()
    */
  const startGazeFocusEventListener = () => {
    if (!eyetrackingIsOn)
      return;

    let rectangles = [];

    keyboard.current.recurseButtons(buttonElement => {
      rectangles.push(
        new TobiiRegion(rectangles.length, types.KEYBOARD_KEY, buttonElement)
      );
    });

    suggestions.current.recurseButtons(buttonElement => {
      rectangles.push(
        new TobiiRegion(rectangles.length, types.SUGGESTED_WORD_BLOCK, buttonElement)
      );
    });

    let dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      rectangles: rectangles
    };

    console.log(dimensions);

    // Start Tobii listen loop
    // ipcRenderer.send(events.ASYNC_LISTEN, dimensions);
  }

  /**
   * Cập nhật CSS của bàn phím. Nếu một phím được tập trung vào,
   * áp dụng hình ảnh động hg-gaze cho nó. TODO: làm cho nó gọn gàng hơn.
   *
   * Nếu phím không được tập trung vào, xóa  hg-gaze.
   * @param {string} keyPressed 
   * @param {boolean} hasFocus 
   */
  const updateKeyboardStyles = (args) => {
    let { key, type, hasFocus } = args;
    let cssClass = `hg-gaze${dwellTimeMS}`

    // // If the key is a simple-keyboard key.
    // if (type === types.KEYBOARD_KEY) {
    //   let cssSelector = specialkeys[key] ? specialkeys[key].id : key;
    //   if (hasFocus) {
    //     keyboard.current.addButtonTheme(cssSelector, cssClass);
    //   } else {
    //     keyboard.current.removeButtonTheme(cssSelector, cssClass);
    //   }
    //   return;
    // }

    if (type === types.SUGGESTED_WORD_BLOCK) {
      let block = suggestions.current.getBlockByTitle(args.title);

      if (block && hasFocus) {
        block.classList.add(cssClass);
      } else {
        block.classList.remove(cssClass);
      }
      return;
    }
  }

  /**
   * tính thời gian 1 phím được nhìn vào.
   * nếu user không rời mắt khỏi phím, hàm trả về 0. 
   * Nếu ko thì trả thời gian theo giaâ
   * 
   * @param {string} key 
   * @param {number} timestamp
   */
  const computeDwellTime = (key, timestamp) => {
    let timestampOfLastFocus = 0;

    setGazeLog(logs => {
      timestampOfLastFocus = logs[key] || timestamp;
      return { [key]: timestamp }
    });

    return Math.abs(timestamp - timestampOfLastFocus);
  }

  /**
   * Sử dụng input hiện tại là gì, tìm input tiếp theo.
   * 
   * @param {object} args 
   */
  const computeInputFromGaze = args => {
    let newInput = keyboard.current.getInput();

    // if (args.type === types.KEYBOARD_KEY) {
    //   if (specialkeys[args.key])
    //     newInput = specialkeys[args.key].update(newInput);
    //   else
    //     newInput = newInput + args.key;
    // }

    if (args.type === types.SUGGESTED_WORD_BLOCK) {
      let block = suggestions.current.getBlockByTitle(args.title);
      newInput = computeInputWithSuggestion(block.innerText);
    }

    return newInput;
  };

  /**
   * Được gọi khi user nhìn vào một phím..
   * 
   * 1. Update keyboard CSS
   * 2. Calculate dwell time of args.key
   * 3. If dwell time is long enough, update working string
   * @param {object} event 
   * @param {object} arg args to the ipc event
   */
  const onGazeFocusEvent = (event, args) => {
    updateKeyboardStyles(args);

    let dwellTimeOfKey = computeDwellTime(args.key, args.timestamp);
    let keyAcceptedAsInput = dwellTimeOfKey >= dwellTimeMS;

    if (keyAcceptedAsInput) {
      let newInput = computeInputFromGaze(args);

      setInput(newInput);
      keyboard.current.setInput(newInput);
    }
  }

  /* Cập nhật chuỗi khi một từ gợi ý được nhấp vào
     Về cơ bản không đặt phép trừ và nối sự khác biệt
  */
  const computeInputWithSuggestion = suggestion => {
    let currentInput = keyboard.current.getInput();

    let lastWord = currentInput.substring(currentInput.lastIndexOf(" ") + 1);
    let trim = suggestion.replace(lastWord, '');

    return `${currentInput}${trim} `;
  }

  const onChange = input => {
    setInput(input);
  };

  /**
   * A shifted layout would have the -shift suffix.
   * So for "dvorak", the shifted variant would be "dvorak-shifted"
   */
  const handleShift = () => {
    const currentlyShifted = (layout.includes('-shift'))

    let newLayout = '';
    if (currentlyShifted)
      newLayout = layout.split('-')[0]
    else
      newLayout = `${layout}-shift`;

    setLayout(newLayout);
  };

  /**
   * Được gọi khi nút bàn phím được nhấn thủ công. Kiểm tra shift hoặc caps lock
   * @param {string} button 
   */
  const onKeyPress = button => {
    if (button === "{shift}" || button === "{lock}") {
      handleShift();
    }
  }

  const onChangeInput = event => {
    const input = event.target.value;
    setInput(input);

    keyboard.current.setInput(input);
  }

  const onLayoutChange = e => {
    setLayout(e.value);
  }

  const onEyeTrackingIsOnChange = event => {
    setEyetrackingIsOn(event.target.checked);
  }

  const onDwellTimeSliderChange = newDwellTimeMS => {
    setDwellTimeMS(newDwellTimeMS);
  }

  /**
   * Khi người dùng nhấp vào từ gợi ý, cập nhật các biến đầu vào.
   * @param {string} clickedWord 
   */
  const onWordSuggestionClick = (clickedWord) => {
    let newInput = computeInputWithSuggestion(clickedWord);

    setInput(newInput);
    keyboard.current.setInput(newInput);
  }

  /**
   * Khi người dùng nhấp vào reset, xoa taáat cả các biến đầu vào.
   */
  const onResetClick = () => {
    setInput('');
    keyboard.current.setInput('');
  }

  /**
    * Được gọi sau khi component mount.
    *
    * Khi sử dụng thay đổi kích thước window,
    * điều này ảnh hưởng đến kích thước màn hình và phím bàn phím
    * có nghĩa là các giá trị này phải được cập nhật vào thiết bị eyetracking
    * Trình xử lý sự kiện Gaze Focus mới cần được bắt đầu
    * để chứa kích thước màn hình mới
   */
  useEffect(() => {
    window.addEventListener('resize', startGazeFocusEventListener);
  }, []);

  /**
    * Được gọi khi người dùng bật/tắt eyetracking
    * Nếu bật eyetracking, nó sẽ chạy startGazeEventListener()
    * để khởi động phiên theo dõi mắt tobii mới
    *
    * Nếu tắt tính năng theo dõi ánh mắt, nó sẽ gỡ bỏ ASYNC_GAZE_FOCUS_EVENT
    * listener từ IPC. Đồng thời xóa CSS khỏi bàn phím
    */
  useEffect(() => {
    ipcRenderer.removeAllListeners(events.ASYNC_GAZE_FOCUS_EVENT);

    if (eyetrackingIsOn) {
      ipcRenderer.on(events.ASYNC_GAZE_FOCUS_EVENT, onGazeFocusEvent);
      startGazeFocusEventListener();
    } else {
      keyboard.current.recurseButtons(buttonElement =>
        updateKeyboardStyles({ key: buttonElement.innerText, type: types.KEYBOARD_KEY, hasFocus: false }));

      suggestions.current.recurseButtons((buttonElement) =>
        updateKeyboardStyles({ key: buttonElement.innerText, type: types.SUGGESTED_WORD_BLOCK, hasFocus: false, title: buttonElement.title }));
    }
  }, [eyetrackingIsOn, dwellTimeMS])

  return (
    <div className={"component-wrapper"}>
      <div className={"settings-bar"}>
        <SliderWrapper
          onChange={onDwellTimeSliderChange} />

        <Calibrate />

        <SelectLayout
          layout={layout}
          onChange={onLayoutChange}
        />

        <label htmlFor='eid' className={"eyetracking-toggle-label"}>Eyetracking</label>
        <Toggle
          className={"eyetracking-toggle"}
          id='eid'
          defaultChecked={eyetrackingIsOn}
          onChange={onEyeTrackingIsOnChange} />
      </div>
      <div className={"textarea-wrapper"}>
        <textarea
          className={"canvas"}
          value={input}
          placeholder={"Type something..."}
          onChange={onChangeInput}
        />
      </div>
      <WordSuggestions
        input={input}
        onSuggestionClick={onWordSuggestionClick}
        onResetClick={onResetClick}
        ref={suggestions}
      />
      <Keyboard
        className={"simple-keyboard"}
        keyboardRef={r => (keyboard.current = r)}
        layout={defaults.DEFAULT_LAYOUTS}
        layoutName={layout}
        onChange={onChange}
        onKeyPress={onKeyPress}
        physicalKeyboardHighlight={true}
      />
    </div>
  );
}

export default KeyboardWrapper;