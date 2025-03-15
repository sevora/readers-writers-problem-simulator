import Process from "./Process";

export const enum FILE_ERROR {
    LOCKED,
    OUT_OF_BOUNDS
}

class PseudoFile {
    content: string;
    lockedBy?: Process<any>;

    /**
     * 
     * @param content 
     */
    constructor(content: string) {
        this.content = content;
    }

    /**
     * 
     * @param index 
     * @returns 
     */
    safeGet(index: number) {
        if (this.lockedBy) 
            return FILE_ERROR.LOCKED;
        if (index > this.content.length-1)
            return FILE_ERROR.OUT_OF_BOUNDS;
        return this.content[index];
    }

    /**
     * 
     */
    lock(process: Process<any>) {
        this.lockedBy = process;
    }

    /**
     * 
     */
    unlock() {
        this.lockedBy = undefined;
    }
}

export default PseudoFile;