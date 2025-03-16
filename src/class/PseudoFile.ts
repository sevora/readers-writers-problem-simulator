import Process from "./Process";

export const enum FILE_ERROR {
    LOCKED,
    OUT_OF_BOUNDS
}

export const enum LOCK_MODE {
    READ,
    WRITE
}

class PseudoFile {
    content: string;
    locker?: Process<any>;
    lockMode?: LOCK_MODE;

    /**
     * 
     * @param content 
     */
    constructor(content: string) {
        this.content = content;
    }

    /**
     * 
     */
    lock(process: Process<any>, lockMode: LOCK_MODE) {
        if (!this.locker && !this.lockMode) {
            this.locker = process;
            this.lockMode = lockMode;
        }
    }

    /**
     * 
     */
    unlock() {
        this.locker = undefined;
        this.lockMode = undefined;
    }
}

export default PseudoFile;