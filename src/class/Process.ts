import VirtualFile from "./VirtualFile";

/**
 * This is based on the process lifecycle.
 */
export const enum PROCESS_STATE {
    READY,
    RUNNING,
    WAITING,
    EXIT
}

/**
 * This is a simulation class for a single process.
 * It is limited to handling data on its own.
 */
class Process<C> {
    /**
     * Holds contextual state of the process.
     */
    context: C;

    /**
     * Function to define the initial state of the process.
     */
    initialize: () => [C, PROCESS_STATE];
    
    /**
     * A single step in processing data of a file.
     */
    step: (self: Process<C>, context: C, file: VirtualFile) => void | PROCESS_STATE;

    /**
     * A reference to the virtual file if any it is connected to
     */
    file?: VirtualFile;

    /**
     * The state of the process in the process lifecycle.
     */
    state: PROCESS_STATE;

    /**
     * Internal value that is only meant to be written or read by an operating system.
     */
    priority: number; 

    constructor(
        initialize: () => [C, PROCESS_STATE], 
        step: (self: Process<C>, context: C, file: VirtualFile) => void
    ) {
        this.initialize = initialize;
        this.step = step;
        
        /* This sets the initial states */
        const unpack = initialize();
        this.context = unpack[0];
        this.state = unpack[1];

        /* This is the priority another internal meant to be ued by OS */
        this.priority = 0;
    }

    /**
     * Use this to connect the process to a file.
     * @param file a virtual file that the process would use.
     */
    connect(file?: VirtualFile) {
        this.file = file;
    }

    /**
     * Use this to disconnect process to existing file.
     */
    disconnect() {
        this.file = undefined;
    }

    /**
     * Use this to update the process consequently running the
     * defined step function and updating the state accordingly.
     */
    update() {
        if (this.file) {
            const state = this.step(this, this.context, this.file);
            if (state) this.state = state;
        }
    }

    reset() {
        const unpack = this.initialize();
        this.context = { ...this.context, ...unpack[0] };
        this.state = unpack[1];
    }
}

export default Process;