import PseudoFile from "./PseudoFile";

export const enum PROCESS_STATE {
    READY,
    RUNNING,
    WAITING,
    EXIT
}

class Process<C> {
    context: C;
    initialize: (self: Process<C>) => [C, PROCESS_STATE];
    step: (self: Process<C>, context: C, file: PseudoFile) => void | PROCESS_STATE;

    file: PseudoFile | undefined;
    state: PROCESS_STATE;
    priority: number; 

    constructor(
        initialize: (self: Process<C>) => [C, PROCESS_STATE], 
        step: (self: Process<C>, context: C, file: PseudoFile) => void
    ) {
        /** */
        this.initialize = initialize;
        this.step = step;
        
        /** */
        const unpack = initialize(this);
        this.context = unpack[0];
        this.state = unpack[1];

        /** */
        this.priority = 0;
    }

    /**
     * 
     * @param file 
     */
    connect(file?: PseudoFile) {
        this.file = file;
    }

    /**
     * 
     */
    update() {
        if (this.file) {
            const state = this.step(this, this.context, this.file);
            if (state) this.state = state;
        }
    }
}

export default Process;