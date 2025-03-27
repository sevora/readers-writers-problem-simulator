import Process, { PROCESS_STATE } from "./Process";

/**
 * This is a simulation for a round-robin operating system.
 */
class OperatingSystem<C> {
    /**
     * The array of processes that the system is handling.
     */
    processes: Process<C>[];

    /**
     * This function is meant to be called after every 
     * update of a process. It is a callback function.
     */
    afterProcessUpdate?: (process: Process<C>) => void;

    /**
     * This function is called after all the processes are 
     * on the exit state.
     */
    afterAllProcessExit?: () => void;

    /**
     * Internal timekeeping for simulation loop.
     */
    now: number;

    /**
     * Internal timekeeping for simulation loop.
     */
    then: number;

    /**
     * Fixed frames-per-second for simulation loop.
     */
    fps: number;

    /**
     * Internal boolean indicating if simulation is running or not.
     */
    running: boolean;

    constructor() {
        this.processes = [];
        
        this.now = Date.now();
        this.then = this.now;
        this.fps = 12;

        this.running = false;
    }

    /**
     * Use this to add a new process into the OS.
     * @param process the new process.
     */
    addProcess(process: Process<any>) {
        this.processes.push(process);
    }

    /**
     * Use this to remove an existing process in the processes array.
     * @param process the reference to the process to be removed.
     */
    removeProcess(process: Process<C>) {
        for (let index = this.processes.length-1; index >= 0; --index) {
            if (process === this.processes[index]) {
                this.processes.splice(index, 1);
                break;
            }
        }
    }

    /**
     * Use this to set the priority of an existing process.
     * @param process the reference to an existing process.
     * @param priority the new priority of said process.
     */
    setPriority(process: Process<C>, priority: number) {
        for (let index = 0; index < this.processes.length; ++index) {
            if (process === this.processes[index]) {
                this.processes[index].priority = priority;
                this.processes.sort((x, y) => y.priority - x.priority);
                break;
            }
        }
    }

    /**
     * Use this to start the OS simulation.
     */
    start() {
        this.running = true;
        this.loop();
    }

    /**
     * Internal simulation looping function. 
     */
    loop() {
        if (!this.running) return;
        window.requestAnimationFrame(this.loop.bind(this));
        
        this.now = Date.now();
        const elapsed = this.now - this.then;
        const interval = 1000 / this.fps;
    
        if (elapsed > interval) {
            this.then = this.now - (elapsed % interval);
            this.step();
        }
    }

    /**
     * Internal step function for the looping.
     */
    step() {
        const hasExitState = [];

        for (let process of this.processes) {
            if (process.state === PROCESS_STATE.EXIT || !process.file) {
                hasExitState.push(true);
                continue;
            }

            process.state = PROCESS_STATE.RUNNING;

            const count = 1 + Math.floor(Math.random() * 3);
            
            for (let attempts = 0; attempts < count; ++attempts) {
                process.update();

                if (this.afterProcessUpdate) 
                    this.afterProcessUpdate(process); 
            }   
        }

        if (hasExitState.length === this.processes.length && this.afterAllProcessExit) {
            this.afterAllProcessExit();
        }
    }

    /**
     * Use this to stop the OS simulation.
     */
    stop() {
        this.running = false;
    }

    /**
     * Use this to reset the OS simulation.
     */
    reset() {
        this.running = false;

        for (let process of this.processes) {
            process.reset();
        }
    }


}

export default OperatingSystem;