
import './style.css';

import Process, { PROCESS_STATE } from './class/Process';
import PseudoFile, { FILE_ERROR, LOCK_MODE } from './class/PseudoFile';

const readFileByLetterSafe = new Process(
  () => {
    return [{ index: 0, output: "" }, PROCESS_STATE.READY]
  },
  (self, context, file) => {
    file.lock(self, LOCK_MODE.READ);
    const character = file.content[context.index];

    if (file.lockMode === LOCK_MODE.WRITE) {
      return PROCESS_STATE.WAITING;
    }

    if (context.index > file.content.length-1) {
      file.unlock();
      return PROCESS_STATE.EXIT;
    }

    context.output += character;
    context.index++;
  }
);

const readFileByWordSafe = new Process(
  () => {
    return [{ index: 0, output: "" }, PROCESS_STATE.READY]
  },
  (self, context, file) => {
    file.lock(self, LOCK_MODE.READ);
    let character: string | FILE_ERROR = "";

    while (typeof character === "string") {
      character = file.content[context.index++];
      
      if (file.lockMode === LOCK_MODE.WRITE) {
        return PROCESS_STATE.WAITING;
      }
      
      if (context.index > file.content.length-1) {
        file.unlock();
        return PROCESS_STATE.EXIT;
      }
      
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
    if (file.locker && file.locker !== self) 
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
    if (file.locker && file.locker !== self) 
      return PROCESS_STATE.WAITING;

    if (context.index > file.content.length-1) {  
      file.unlock();
      return PROCESS_STATE.EXIT;
    }

    file.lock(self, LOCK_MODE.WRITE);
    const character = file.content[context.index];
    const transform = character.toUpperCase();
    file.content = file.content.substring(0, context.index) + transform + file.content.substring(context.index + 1);
    context.index++;
  }
);

let file = new PseudoFile("The quick brown fox jumps over the lazy dog.")

switchCaseWriterUnsafe.connect(file);
switchCaseWriterSafe.connect(file);
readFileByLetterSafe.connect(file);
readFileByWordSafe.connect(file);

// const switchCaseWriterUnsafeTimer = setInterval(function() {
//   switchCaseWriterUnsafe.update();
//   const { state } = switchCaseWriterUnsafe;
//   console.log(switchCaseWriterUnsafe.file?.content, state);

//   if (state === PROCESS_STATE.EXIT) {
//     clearInterval(switchCaseWriterUnsafeTimer);
//   }
// }, 300);


const readFileByLetterTimer = setInterval(function() {
  readFileByLetterSafe.update();
  const { state } = readFileByLetterSafe;
  const { output } = readFileByLetterSafe.context;
  console.log(output, state);
  
  if (state === PROCESS_STATE.EXIT) {
    clearInterval(readFileByLetterTimer);
  }
}, 100);

const switchCaseWriterSafeTimer = setInterval(function() {
  switchCaseWriterSafe.update();
  const { state } = switchCaseWriterSafe;
  console.log(switchCaseWriterSafe.file?.content, state);

  if (state === PROCESS_STATE.EXIT) {
    clearInterval(switchCaseWriterSafeTimer);
  }
}, 100);

const readFileByWordTimer = setInterval(function() {
  readFileByWordSafe.update();
  const { state } = readFileByWordSafe;
  const { output } = readFileByWordSafe.context;
  console.log(output, state);
  
  if (state === PROCESS_STATE.EXIT) {
    clearInterval(readFileByWordTimer);
  }
}, 100);