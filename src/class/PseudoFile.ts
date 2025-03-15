export const enum FILE_ERROR {
    LOCKED,
    OUT_OF_BOUNDS
}

class PseudoFile {
    content: string;
    locked: boolean;

    /**
     * 
     * @param content 
     */
    constructor(content: string) {
        this.content = content;
        this.locked = false;
    }

    /**
     * 
     * @param index 
     * @returns 
     */
    readAt(index: number) {
        if (this.locked) 
            return FILE_ERROR.LOCKED;
        if (index > this.content.length-1)
            return FILE_ERROR.OUT_OF_BOUNDS;
        return this.content[index];
    }

    /**
     * 
     */
    lock() {
        this.locked = true;
    }

    /**
     * 
     */
    unlock() {
        this.locked = false;
    }
}

export default PseudoFile;