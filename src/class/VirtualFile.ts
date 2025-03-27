import Process from "./Process";

/**
 * These values refer to possible file IO errors.
 */
export const enum FILE_ERROR {
    LOCKED,
    OUT_OF_BOUNDS
}

/**
 * These values refer to the locking mode of a file
 * whether it is being read or written to at the moment.
 */
export const enum LOCK_MODE {
    READ,
    WRITE
}

/**
 * A class to represent a file that the processes can manage.
 */
class VirtualFile {
    filename: string;
    content: string;
    backupContent: string;
    locker?: Process<any>;
    lockMode?: LOCK_MODE;

    disabledLock: boolean;
    statechange?: (self: VirtualFile) => void;

    /**
     * Create a new virtual file.
     * @param content the contents of the file.
     */
    constructor(filename: string, content: string) {
        this.filename = filename;
        this.content = content;
        this.backupContent = content;
        this.locker = undefined;
        this.lockMode = undefined;
        this.disabledLock = false;
    }

     /**
     * Use this to get one character at the given index of the content.
     * @param process the process reading the file.
     * @param index the index of which the content will be read at.
     * @returns possibly the character or a FILE_ERROR.
     */
     readAt(process: Process<any>, index: number) {
        if (this.locker && this.locker !== process && this.lockMode === LOCK_MODE.WRITE) 
            return FILE_ERROR.LOCKED;
        if (index > this.content.length-1)
            return FILE_ERROR.OUT_OF_BOUNDS;
        return this.content[index];
    }

    /**
     * Use this to write one character to the index of the file.
     * @param process the process writing to the file.
     * @param index the index at which to overwrite the file from.
     * @param transform the function describing how to change the character of the file.
     * @returns possibly undefined which denotes success or a FILE_ERROR.
     */
    writeAt(process: Process<any>, index: number, transform: (character: string) => string) {
        if (this.locker && this.locker !== process)
            return FILE_ERROR.LOCKED;
        if (index > this.content.length-1)
            return FILE_ERROR.OUT_OF_BOUNDS;
        const character = this.content[index];
        this.content = this.content.substring(0, index) + transform(character) + this.content.substring(index + 1);
        if (this.statechange) this.statechange(this);
    }

    /**
     * Use this to lock a file for reading or writing.
     * @param process the process occupying the file.
     * @param lockMode the lock mode whether reading or writing.
     */
    lock(process: Process<any>, lockMode: LOCK_MODE) {
        if (!this.disabledLock && !this.locker && !this.lockMode) {
            this.locker = process;
            this.lockMode = lockMode;
        }
    }

    /**
     * Use this to unlock the file.
     */
    unlock() {
        this.locker = undefined;
        this.lockMode = undefined;
    }

    /**
     * Use this to disable lock for disabling solutions.
     */
    disableLock() {
        this.disabledLock = true;
        this.locker = undefined;
        this.lockMode = undefined;
    }

    /**
     * Use this to enable lock for solutions.
     */
    enableLock() {
        this.disabledLock = false;
    }

    /**
     * 
     */
    reset() {
        this.content = this.backupContent;
    }
}

export default VirtualFile;