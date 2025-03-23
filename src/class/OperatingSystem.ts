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
     * The interval calculated based on the frames-per-second.
     */
    interval: number;

    /**
     * Internal boolean indicating if simulation is running or not.
     */
    running: boolean;

    constructor(afterProcessUpdate?: (process: Process<C>) => void) {
        this.processes = [];
        this.afterProcessUpdate = afterProcessUpdate;
        
        this.now = Date.now();
        this.then = this.now;
        this.fps = 1;
        this.interval = 1000 / this.fps;

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
        window.requestAnimationFrame(this.loop);
        
        this.now = Date.now();
        let elapsed = this.now - this.then;
    
        if (elapsed > this.interval) {
            this.then = this.now - (elapsed % this.interval);
            this.step();
        }
    }

    /**
     * Internal step function for the looping.
     */
    step() {
        for (let process of this.processes) {
            if (process.state !== PROCESS_STATE.EXIT) {
                process.state = PROCESS_STATE.RUNNING;
                process.update();
                if (this.afterProcessUpdate) 
                    this.afterProcessUpdate(process);
            } 
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
            process.initialize();
        }
    }


}

export default OperatingSystem;