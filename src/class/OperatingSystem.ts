import Process, { PROCESS_STATE } from "./Process";

class OperatingSystem {
    processes: Process<any>[];

    now: number;
    then: number;
    fps: number;

    running: boolean;

    constructor() {
        this.processes = [];
        
        this.now = Date.now();
        this.then = this.now;
        this.fps = 1;

        this.running = false;
    }

    /**
     * 
     * @param process 
     */
    addProcess(process: Process<any>) {
        this.processes.push(process);
    }

    /**
     * 
     * @param index 
     */
    removeProcess(index: number) {
        this.processes.splice(index, 1);
    }

    /**
     * 
     * @param index 
     * @param priority 
     */
    setPriority(index: number, priority: number) {
        this.processes[index].priority = priority;
    }

    /**
     * 
     */
    start() {
        this.running = true;
        this.loop();
    }

    /**
     * 
     * @returns 
     */
    loop() {
        if (!this.running) return;
        window.requestAnimationFrame(this.loop);
        
        this.now = Date.now();
        let elapsed = this.now - this.then;
        let interval = 1000 / this.fps;
    
        if (elapsed > interval) {
            this.then = this.now - (elapsed % interval);
            this.step();
        }

    }

    /**
     * 
     */
    step() {
        const processes = this.processes.toSorted((x, y) => y.priority - x.priority);
        for (let process of processes) {
            if (process.state !== PROCESS_STATE.EXIT) {
                process.state = PROCESS_STATE.RUNNING;
                process.update();
            } 

            // update display
        }
    }

    /**
     * 
     */
    stop() {
        this.running = false;
    }


}

export default OperatingSystem;