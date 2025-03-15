
import './style.css';

import Process, { PROCESS_STATE } from './class/Process';
import PseudoFile, { FILE_ERROR } from './class/PseudoFile';

const readFileByLetter = new Process(
  () => {
    return [{ index: 0, output: "" }, PROCESS_STATE.READY]
  },
  (context, file) => {
    const value = file.readAt(context.index);
    switch (value) {
      case FILE_ERROR.LOCKED:
        return PROCESS_STATE.WAITING;
      case FILE_ERROR.OUT_OF_BOUNDS:
        return PROCESS_STATE.EXIT;
      default:
        context.output += value;
        context.index++;
        break;
    }
  }
);

const readFileByWord = new Process(
  () => {
    return [{ index: 0, output: "" }, PROCESS_STATE.READY]
  },
  (context, file) => {
    let value: string | FILE_ERROR = "";

    while (typeof value === "string") {
      value = file.readAt(context.index++);
      
      if (value === FILE_ERROR.LOCKED)
        return PROCESS_STATE.WAITING;
      
      if (value === FILE_ERROR.OUT_OF_BOUNDS) 
        return PROCESS_STATE.EXIT;
      
      context.output += value;
      if (value === " ") 
        break;
    }
  }
);

readFileByLetter.connect(
  new PseudoFile("The quick brown fox jumps over the lazy dog")
);

readFileByWord.connect(
  new PseudoFile("The quick brown fox jumps over the lazy dog")
);

// const readFileByLetterTimer = setInterval(function() {
//   readFileByLetter.process();
//   const { state } = readFileByLetter;
//   const { output } = readFileByLetter.context;
//   console.log(output, state);
  
//   if (state === PROCESS_STATE.EXIT) {
//     clearInterval(readFileByLetterTimer);
//   }
// }, 100);

const readFileByWordTimer = setInterval(function() {
  readFileByWord.update();
  const { state } = readFileByWord;
  const { output } = readFileByWord.context;
  console.log(output, state);
  
  if (state === PROCESS_STATE.EXIT) {
    clearInterval(readFileByWordTimer);
  }
}, 100);