
import './style.css';

import Process, { PROCESS_STATE } from './class/Process';
import PseudoFile, { FILE_ERROR } from './class/PseudoFile';

const readFileByLetter = new Process(
  () => {
    return [{ index: 0, output: "" }, PROCESS_STATE.READY]
  },
  (_self, context, file) => {
    const character = file.safeGet(context.index);
    switch (character) {
      case FILE_ERROR.LOCKED:
        return PROCESS_STATE.WAITING;
      case FILE_ERROR.OUT_OF_BOUNDS:
        return PROCESS_STATE.EXIT;
      default:
        context.output += character;
        context.index++;
        break;
    }
  }
);

const readFileByWord = new Process(
  () => {
    return [{ index: 0, output: "" }, PROCESS_STATE.READY]
  },
  (_self, context, file) => {
    let character: string | FILE_ERROR = "";

    while (typeof character === "string") {
      character = file.safeGet(context.index++);
      
      if (character === FILE_ERROR.LOCKED)
        return PROCESS_STATE.WAITING;
      
      if (character === FILE_ERROR.OUT_OF_BOUNDS) 
        return PROCESS_STATE.EXIT;
      
      context.output += character;
      if (character === " ") 
        break;
    }
  }
);

const switchCaseWriterUnsafe = new Process(
  () => {
    return [{ index: 0 }, PROCESS_STATE.READY]
  },
  (self, context, file) => {
    if (file.lockedBy && file.lockedBy !== self) 
      return PROCESS_STATE.WAITING;
    
    if (context.index > file.content.length-1) {  
      return PROCESS_STATE.EXIT;
    }

    const character = file.content[context.index];
    const transform = character.toUpperCase();
    file.content = file.content.substring(0, context.index) + transform + file.content.substring(context.index + 1);
    context.index++;
  }
);

const switchCaseWriterSafe = new Process(
  () => {
    return [{ index: 0 }, PROCESS_STATE.READY]
  },
  (self, context, file) => {
    if (file.lockedBy && file.lockedBy !== self) 
      return PROCESS_STATE.WAITING;

    if (context.index > file.content.length-1) {  
      file.unlock();
      return PROCESS_STATE.EXIT;
    }

    file.lock(self);
    const character = file.content[context.index];
    const transform = character.toUpperCase();
    file.content = file.content.substring(0, context.index) + transform + file.content.substring(context.index + 1);
    context.index++;
  }
);

let file = new PseudoFile("The quick brown fox jumps over the lazy dog.")

switchCaseWriterUnsafe.connect(file);
switchCaseWriterSafe.connect(file);
readFileByLetter.connect(file);
readFileByWord.connect(file);

// const switchCaseWriterUnsafeTimer = setInterval(function() {
//   switchCaseWriterUnsafe.update();
//   const { state } = switchCaseWriterUnsafe;
//   console.log(switchCaseWriterUnsafe.file?.content, state);

//   if (state === PROCESS_STATE.EXIT) {
//     clearInterval(switchCaseWriterUnsafeTimer);
//   }
// }, 300);


const switchCaseWriterSafeTimer = setInterval(function() {
  switchCaseWriterSafe.update();
  const { state } = switchCaseWriterSafe;
  console.log(switchCaseWriterSafe.file?.content, state);

  if (state === PROCESS_STATE.EXIT) {
    clearInterval(switchCaseWriterSafeTimer);
  }
}, 100);

const readFileByLetterTimer = setInterval(function() {
  readFileByLetter.update();
  const { state } = readFileByLetter;
  const { output } = readFileByLetter.context;
  console.log(output, state);
  
  if (state === PROCESS_STATE.EXIT) {
    clearInterval(readFileByLetterTimer);
  }
}, 100);

const readFileByWordTimer = setInterval(function() {
  readFileByWord.update();
  const { state } = readFileByWord;
  const { output } = readFileByWord.context;
  console.log(output, state);
  
  if (state === PROCESS_STATE.EXIT) {
    clearInterval(readFileByWordTimer);
  }
}, 100);