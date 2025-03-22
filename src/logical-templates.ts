import Process, { PROCESS_STATE } from "./class/Process";
import VirtualFile from "./class/VirtualFile";
import { FILE_ERROR, LOCK_MODE } from "./class/VirtualFile";

/**
 * This is based on the Readers-Writers problem.
 */
export const enum PROCESS_TYPE {
    READER,
    WRITER
}

export interface VisualizeContext {
    /**
     * The index refers to a variable counter for the process operation.
     */
    index: number;

    /**
     * This is meant to store the process output if any.
     */
    output: string;

    /**
     * This refers to whether the process is a reader or writer.
     * For visualization purposes only.
     */
    type: PROCESS_TYPE;

    /**
     * This is a callback to be called whenever the process updates.
     */
    statechange: (self: Process<VisualizeContext>) => void;
}

/**
 * Safe-version of reader process that reads by letter.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createReadByLetterSafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.READER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            file.lock(self, LOCK_MODE.READ);
            const character = file.readAt(self, context.index);

            if (character === FILE_ERROR.LOCKED) {
                return PROCESS_STATE.WAITING;
            }

            if (character === FILE_ERROR.OUT_OF_BOUNDS) {
                file.unlock();
                return PROCESS_STATE.EXIT;
            }

            context.output += character;
            context.index++;
        }
    );
}


/**
 * Unsafe-version of reader process that reads by letter.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createReadByLetterUnsafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.READER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            const character = file.readAt(self, context.index);

            if (character === FILE_ERROR.LOCKED) {
                return PROCESS_STATE.WAITING;
            }

            if (character === FILE_ERROR.OUT_OF_BOUNDS) {
                return PROCESS_STATE.EXIT;
            }

            context.output += character;
            context.index++;
        }
    );
}


/**
 * Safe-version of reader process that reads by word.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createReadByWordSafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.READER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            file.lock(self, LOCK_MODE.READ);
            let character: string | FILE_ERROR = "";

            while (true) {
                character = file.readAt(self, context.index++);

                if (character === FILE_ERROR.LOCKED) {
                    return PROCESS_STATE.WAITING;
                }

                if (character === FILE_ERROR.OUT_OF_BOUNDS) {
                    file.unlock();
                    return PROCESS_STATE.EXIT;
                }

                context.output += character;
                if (character === " ")
                    break;
            }
        }
    );
}


/**
 * Unsafe-version of reader process that reads by word.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createReadByWordUnsafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.READER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            let character: string | FILE_ERROR = "";

            while (true) {
                character = file.readAt(self, context.index++);

                if (character === FILE_ERROR.LOCKED) {
                    return PROCESS_STATE.WAITING;
                }

                if (character === FILE_ERROR.OUT_OF_BOUNDS) {
                    return PROCESS_STATE.EXIT;
                }

                context.output += character;
                if (character === " ")
                    break;
            }
        }
    );
}

/**
 * Safe-version of writer process that converts all to uppercase.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process. 
 */
export function createWriteUppercaseSafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.WRITER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            file.lock(self, LOCK_MODE.WRITE);
            const result = file.writeAt(self, context.index, (character) => character.toUpperCase());

            if (result === FILE_ERROR.LOCKED)
                return PROCESS_STATE.WAITING;

            if (result === FILE_ERROR.OUT_OF_BOUNDS) {
                file.unlock();
                return PROCESS_STATE.EXIT;
            }

            context.index++
        }
    );
}

/**
 * Unsafe-version of writer process that converts all to uppercase.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process. 
 */
export function createWriteUppercaseUnsafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.WRITER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            const result = file.writeAt(self, context.index, (character) => character.toUpperCase());

            if (result === FILE_ERROR.LOCKED)
                return PROCESS_STATE.WAITING;

            if (result === FILE_ERROR.OUT_OF_BOUNDS) {
                return PROCESS_STATE.EXIT;
            }

            context.index++
        }
    );
}


/**
 * Safe-version of writer process that converts all to lowercase.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createWriteLowercaseSafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.WRITER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            file.lock(self, LOCK_MODE.WRITE);
            const result = file.writeAt(self, context.index, (character) => character.toLowerCase());

            if (result === FILE_ERROR.LOCKED)
                return PROCESS_STATE.WAITING;

            if (result === FILE_ERROR.OUT_OF_BOUNDS) {
                file.unlock();
                return PROCESS_STATE.EXIT;
            }

            context.index++
        }
    );
}


/**
 * Unsafe-version of writer process that converts all to lowercase.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createWriteLowercaseUnsafe(statechange: (self: Process<VisualizeContext>) => void) {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.WRITER, statechange }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            const result = file.writeAt(self, context.index, (character) => character.toLowerCase());

            if (result === FILE_ERROR.LOCKED)
                return PROCESS_STATE.WAITING;

            if (result === FILE_ERROR.OUT_OF_BOUNDS) {
                return PROCESS_STATE.EXIT;
            }

            context.index++
        }
    );
}

/**
 * 
 * @returns 
 */
export function createPangramFile() {
    return new VirtualFile("pangram.txt", "The quick brown fox jumps over the lazy dog.");
}

/**
 * 
 * @returns 
 */
export function createEinsteinFile() {
    return new VirtualFile("einstein.txt", "I have no special talent. I am only passionately curious.");
}

/**
 * 
 * @returns 
 */
export function createBruceLeeFile() {
    return new VirtualFile("bruce_lee.txt", "The successful warrior is the average man, with laser-like focus.");
}

/**
 * 
 * @returns 
 */
export function createCaesarFile() {
    return new VirtualFile("caesar.txt", "I came, I saw, I conquered");
}