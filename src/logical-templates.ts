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
    statechange?: (self: Process<VisualizeContext>) => void;
}

/**
 * Reader process that reads by letter.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createReadByLetter() {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.READER }, PROCESS_STATE.READY]
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
 * Writer process that converts all to uppercase.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process. 
 */
export function createWriteUppercase() {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.WRITER }, PROCESS_STATE.READY]
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
 * Writer process that converts all to lowercase.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createWriteDistort() {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.WRITER }, PROCESS_STATE.READY]
        },
        (self, context, file) => {
            file.lock(self, LOCK_MODE.WRITE);
            const result = file.writeAt(self, context.index, (_character) => 
                ["$","%","^", "=", "+", "!"][Math.floor(Math.random() * 6)]
            );

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
 * Writer process that converts all to lowercase.
 * @param statechange the callback whenever the process has a statechange.
 * @returns the process.
 */
export function createWriteLowercase() {
    return new Process<VisualizeContext>(
        () => {
            return [{ index: 0, output: "", type: PROCESS_TYPE.WRITER }, PROCESS_STATE.READY]
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

export function createRooseveltFile() {
    return new VirtualFile("roosevelt.txt", "Great minds discuss ideas; average minds discuss events; small minds discuss people.");
}


export function createEinsteinFile() {
    return new VirtualFile("einstein.txt", "I have no special talent. I am only passionately curious.");
}


export function createNietzscheFile() {
    return new VirtualFile("nietzsche.txt", "That which does not kill us makes us stronger.");
}

export function createAristotleFile() {
    return new VirtualFile("aristotle.txt", "We are what we repeatedly do; excellence, then, is not an act but a habit.");
}

export function createShakespeareFile() {
    return new VirtualFile("shakespeare.txt", "It is not in the stars to hold our destiny but in ourselves.");
}