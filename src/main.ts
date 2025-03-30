import 'material-icons/iconfont/material-icons.css';

import OperatingSystem from './class/OperatingSystem';
import Process, { PROCESS_STATE } from './class/Process';
import VirtualFile from './class/VirtualFile';

import { createNietzscheFile, createRooseveltFile, createEinsteinFile, createAristotleFile, PROCESS_TYPE, VisualizeContext, createShakespeareFile, createWriteDistort } from './logical-templates';
import { createManagementPanelContentFileDOM, createManagementPanelContentProcessDOM, createManagementPanelHeaderButtonDOM, createSandboxFileDOM, createSandboxProcessDOM } from './dom-templates';
import { createReadByLetter, createWriteLowercase, createWriteUppercase } from './logical-templates';

const managementPanelHeader = document.querySelector("#management-panel-header") as HTMLDivElement;
const managementPanelContent = document.querySelector("#management-panel-content") as HTMLDivElement;
const managementPanelHeaderButtons = attachManagementPanelHeaderButtons();
const controlPlayStopButton = document.querySelector("#control-play-stop") as HTMLButtonElement;
const controlResetButton = document.querySelector("#control-reset") as HTMLButtonElement;
const controlClearAllButton = document.querySelector("#control-clear-all") as HTMLButtonElement;
const controlSolutionToggle = document.querySelector("#control-solution-toggle") as HTMLButtonElement;
const counterProcess = document.querySelector("#counter-process") as HTMLDivElement;
const counterFile = document.querySelector("#counter-file") as HTMLDivElement;
const solution = document.querySelector("#solution") as HTMLDivElement;
const sandbox = document.querySelector("#sandbox") as HTMLDivElement;
const preventInteractionsCover = document.querySelector("#prevent-interactions-cover") as HTMLDivElement;
const connectionCanvas = document.querySelector("#connection-canvas") as HTMLCanvasElement;
const connectionCanvasContext = connectionCanvas.getContext("2d")!;

const PROCESS_CAP = 5;
const FILE_CAP = 5;

let resourceLockingEnabled = false;
let connectThis: [Process<VisualizeContext>, HTMLDivElement] | undefined;
let processEntities: [Process<VisualizeContext>, HTMLDivElement][] = [];
let fileEntities: [VirtualFile, HTMLDivElement][] = [];

let now = Date.now();
let then = now;
let fps = 60;
let interval = 1000 / fps;
let width = window.innerWidth * 2;
let height = window.innerHeight * 2;
let mousePosition: [number, number] | undefined = undefined;

const operatingSystem = new OperatingSystem<VisualizeContext>();

/**
 * We set the callback of every process update to call
 * the visualizable context statechange on that specific process.
 */
operatingSystem.afterProcessUpdate = (process) => {
  if (process.context.statechange)
    process.context.statechange(process);
}

/**
 * When all the processes are terminated we want to 
 * stop the simulation as a whole including the graphical interface.
 */
operatingSystem.afterAllProcessExit = () => {
  setTimeout(() => {
    stopSimulation();
  }, 1);
}

/**
 * This is used to setup the canvas once.
 * We set up its size and call the render loop.
 */
function setupConnectionCanvas() {
  connectionCanvas.width = width;
  connectionCanvas.height = height;
  loopConnectionCanvas();
}

/**
 * We want to loop the connection canvas.
 * This should display the connections of each 
 * node efficiently.
 */
function loopConnectionCanvas() {
  window.requestAnimationFrame(loopConnectionCanvas);

  now = Date.now();
  let elapsed = now - then;

  if (elapsed > interval) {
    then = now - (elapsed % interval);
    renderConnectionCanvas();
  }
}

/**
 * We define this as the rendering of the connection canvas.
 * The only point of this is to draw lines accordingly from processes
 * to files.
 */
function renderConnectionCanvas() {
  const context = connectionCanvasContext;
  context.clearRect(0, 0, width, height);

  // This block specifies how to render attempts 
  // when connecting a process to a file.
  if (connectThis && mousePosition) {
    const [process, element] = connectThis;
    const box = element.getBoundingClientRect();

    context.strokeStyle = process.context.type === PROCESS_TYPE.READER ? "#00e24b" : "#4f9fdb";
    context.lineWidth = 5;
    context.globalAlpha = 0.5;

    context.beginPath();
    context.moveTo((parseInt(element.style.left) + box.width * 0.5) * 2, (parseInt(element.style.top) + box.height * 0.5) * 2);
    context.lineTo(mousePosition[0], mousePosition[1]);
    context.stroke();
  }

  // This displays the existing connections of processes
  // to the files accordingly.
  for (const [process, processElement] of processEntities) {
    if (!process.file) continue;

    for (const [file, fileElement] of fileEntities) {
      if (process.file === file) {

        const processBox = processElement.getBoundingClientRect();
        const fileBox = fileElement.getBoundingClientRect();

        const start = [
          (parseInt(processElement.style.left) + processBox.width * 0.5) * 2,
          (parseInt(processElement.style.top) + processBox.height * 0.5) * 2
        ];

        const end = [
          (parseInt(fileElement.style.left) + fileBox.width * 0.5) * 2,
          (parseInt(fileElement.style.top) + fileBox.height * 0.5) * 2
        ]

        context.strokeStyle = process.context.type === PROCESS_TYPE.READER ? "#00e24b" : "#4f9fdb";
        context.lineWidth = 5;
        context.globalAlpha = 1.0;

        if ((process.state === PROCESS_STATE.WAITING || process.state === PROCESS_STATE.EXIT) && operatingSystem.running) {
          context.globalAlpha = 0.25;
        }

        context.beginPath();
        context.moveTo(start[0], start[1]);
        context.lineTo(end[0], end[1]);
        context.stroke();
        break;
      }
    }
  }

}

/**
 * We use this to remove the classes that will make 
 * it seem that the current header in the panel is selected.
 */
function clearManagementPanelHeaderSelection() {
  for (const child of managementPanelHeader.children) {
    child.className = "";
  }
}

/**
 * This adds all the options in the management panel header
 * and specifies how to render each one's children.
 */
function attachManagementPanelHeaderButtons() {
  const managementPanelHeaderButtons = [
    createManagementPanelHeaderButtonDOM("Processes"),
    createManagementPanelHeaderButtonDOM("Files"),
    createManagementPanelHeaderButtonDOM("Overview")
  ];

  for (let index = 0; index < managementPanelHeaderButtons.length; ++index) {
    const element = managementPanelHeaderButtons[index];

    element.addEventListener("click", (event) => {
      clearManagementPanelHeaderSelection();
      (event.currentTarget as HTMLButtonElement).classList.add("bg-neutral-900", "hover:!bg-neutral-900");

      switch (index) {
        case 0:
          displayManagementPanelContentProcesses();
          break;
        case 1:
          displayManagementPanelContentFiles();
          break;
        case 2:
          displayManagementPanelContentOverview();
          break;
      }
    });
  }

  managementPanelHeader.append(...managementPanelHeaderButtons);
  return managementPanelHeaderButtons;
}

/**
 * This displays the processes in the management panel
 * and specifies how to add these processes and how these
 * processes behave within the simulation through their handlers.
 */
function displayManagementPanelContentProcesses() {
  managementPanelContent.replaceChildren();

  const processGenerators = [
    ["Read by letter", PROCESS_TYPE.READER, createReadByLetter],
    ["Write to uppercase", PROCESS_TYPE.WRITER, createWriteUppercase],
    ["Write to lowercase", PROCESS_TYPE.WRITER, createWriteLowercase],
    ["Distort content", PROCESS_TYPE.WRITER, createWriteDistort]
  ] as const

  for (let index = 0; index < processGenerators.length; ++index) {
    const [name, processType, generator] = processGenerators[index];
    const button = createManagementPanelContentProcessDOM(processType, name);

    button.addEventListener("click", function (_event) {
      if (processEntities.length + 1 > PROCESS_CAP) return;
      
      /**
       * Event handler when the user is connecting the 
       * existing process to a file.
       */
      const handleConnect = (_event: MouseEvent) => {
        if (process.file || connectThis) {
          connectThis = undefined;
          mousePosition = undefined;
          process.disconnect();
          return;
        }

        connectThis = [process, processDOM];
      }

      /**
       * Event handler when the user is deleting the 
       * process.
       */
      const handleDelete = (_event: MouseEvent) => {
        for (let index = processEntities.length - 1; index >= 0; --index) {
          if (processEntities[index][0] === process) {
            processEntities.splice(index, 1);
            break;
          }
        }

        connectThis = undefined;
        mousePosition = undefined;
        operatingSystem.removeProcess(process);
        processDOM.remove();
        updateCounterDisplay();
        controlPlayStopButton.disabled = getConnectionCount() === 0;
      }

      const handleDrag = (_event: MouseEvent, _x: number, y: number) => {
        operatingSystem.setPriority(process, -y);
        updateProcessesRankDisplay();
        updateSolutionDisplay();
      }

      const adjustedName = `${name} (${generateRandomString(3)})`;
      const processDOM = createSandboxProcessDOM(processType, adjustedName, handleConnect, handleDelete, handleDrag);
      const process = generator();

      // again, this gets called whenever the process state's change
      process.context.statechange = (self) => {
        if (self.context.type === PROCESS_TYPE.READER) {
          processDOM.querySelector(".output")!.innerHTML = self.context.output;
        }

        switch (self.state) {
          case PROCESS_STATE.READY:
            processDOM.classList.add("ready-process");
            processDOM.classList.remove("running-process", "waiting-process", "exit-process");
            break;
          case PROCESS_STATE.RUNNING:
            processDOM.classList.add("running-process");
            processDOM.classList.remove("ready-process", "waiting-process", "exit-process");
            break;
          case PROCESS_STATE.WAITING:
            processDOM.classList.add("waiting-process");
            processDOM.classList.remove("ready-process", "running-process", "exit-process");
            break;
          case PROCESS_STATE.EXIT:
            processDOM.classList.add("exit-process");
            processDOM.classList.remove("ready-process", "running-process", "waiting-process");
            break;
        }

        displayManagementPanelContentOverview();
      }

      operatingSystem.addProcess(process);
      sandbox.appendChild(processDOM);
      processEntities.push([process, processDOM]);

      // reposition process to center upon getting added
      const rectangle = processDOM.getBoundingClientRect();
      const centerY = window.innerHeight * 0.5 - rectangle.height * 0.5;
      processDOM.style.left = window.innerWidth * 0.5 - rectangle.width * 0.5 + "px";
      processDOM.style.top = centerY + "px";
      operatingSystem.setPriority(process, -centerY);

      // update related displays for accuracy
      updateCounterDisplay();
      updateProcessesRankDisplay();
      updateSolutionDisplay();
    });

    managementPanelContent.appendChild(button);
  }

}

/**
 * This is how the files are rendered as options in the 
 * management panel. This also tells us how to add those files
 * in the graphical simulation and how they behave through handlers.
 */
function displayManagementPanelContentFiles() {
  managementPanelContent.replaceChildren();

  const fileGenerators = [
    createRooseveltFile,
    createEinsteinFile,
    createNietzscheFile,
    createAristotleFile,
    createShakespeareFile
  ];

  for (let index = 0; index < fileGenerators.length; ++index) {
    const generator = fileGenerators[index]
    const { filename, content } = generator();
    const button = createManagementPanelContentFileDOM(filename, content);

    button.addEventListener("click", function (_event) {
      if (fileEntities.length + 1 > PROCESS_CAP) return;
      const file = generator();

      /**
       * Event-handler for when the user is deleting
       * the file within the simulation.
       */
      const handleDelete = (_event: MouseEvent) => {
        for (const [process] of processEntities) {
          if (process.file === file) {
            process.disconnect();
          }
        }

        for (let index = fileEntities.length - 1; index >= 0; --index) {
          if (fileEntities[index][0] === file) {
            fileEntities.splice(index, 1);
            break;
          }
        }

        fileDOM.remove();
        controlPlayStopButton.disabled = getConnectionCount() === 0;
      }

      // we adjust the filename for clarity in the fact that we're spawning 
      // different files regardless of the same content.
      const adjustedFilename = filename.split(".").map(
        (value, index) => {
          if (index === 0)
            return value + "_" + generateRandomString(3)
          return value;
        }
      ).join('.');

      const fileDOM = createSandboxFileDOM(adjustedFilename, content, handleDelete);

      /**
       * This is part of the listener to be able to 
       * connect the process to a file.
       */
      fileDOM.addEventListener("mousedown", _event => {
        if (!connectThis) return;
        const process = connectThis[0];
        process.connect(file);
        connectThis = undefined;
        mousePosition = undefined;
        controlPlayStopButton.disabled = getConnectionCount() === 0;
      });

      /**
       * When the file's state changes we just want to ensure
       * that it displays the latest content.
       */
      file.statechange = (self) => {
        fileDOM.querySelector(".content")!.innerHTML = self.content;
      }

      sandbox.appendChild(fileDOM);
      fileEntities.push([file, fileDOM]);

      // also position it to center on add
      const rectangle = fileDOM.getBoundingClientRect();
      const centerY = window.innerHeight * 0.5 - rectangle.height * 0.5;
      fileDOM.style.left = window.innerWidth * 0.5 - rectangle.width * 0.5 + "px";
      fileDOM.style.top = centerY + "px";

      if (resourceLockingEnabled)
        file.enableLock();

      updateCounterDisplay();
    });

    managementPanelContent.appendChild(button);

  }
}

/**
 * 
 */
function displayManagementPanelContentOverview() {
  managementPanelContent.replaceChildren();

  if (operatingSystem.running) {
    // if the simulation is running then,
    const tableDOM = document.createElement("table");
    tableDOM.className = "max-w-[200px] table-auto";

    // we aggregate the table row values
    const rows = [
      ["Process", "State"],
      ...processEntities.map(([process, processDOM]) => {
        let state;
        switch (process.state) {
          case PROCESS_STATE.READY:
            state = "Ready";
            break;
          case PROCESS_STATE.RUNNING:
            state = "Running";
            break;
          case PROCESS_STATE.WAITING:
            state = "Waiting";
            break;
          case PROCESS_STATE.EXIT:
            state = "Exit";
            break;
        }
        return [processDOM.querySelector(".name")!.innerHTML, state]
      })
    ];

    // create the equivalent DOM elements
    for (const row of rows) {
      const rowDOM = document.createElement("tr");
      
      for (const value of row) {
        const dataDOM = document.createElement("td");
        dataDOM.className = "px-3 border break-words";
        dataDOM.innerHTML = value;
        rowDOM.appendChild(dataDOM);
      }

      tableDOM.appendChild(rowDOM);
    }

    // and display those DOM elements
    managementPanelContent.appendChild(tableDOM);
    const disclaimer = document.createElement("div");
    disclaimer.className = "max-w-[200px] text-left px-3 select-none";
    disclaimer.innerHTML = "Moving out of this panel will clear the values and overview.";
    managementPanelContent.appendChild(disclaimer);
  } else {
    // when the simulation is not running, we display this information
    const container = document.createElement("div");
    container.className = "max-w-[200px] text-left px-3 select-none";
    container.innerHTML = "Run simulation to see values in real-time.";
    managementPanelContent.appendChild(container);
  }
}

/**
 * Function to count and update the rank of each process in the DOM. Under-the-hood
 * this relies on the process' priority.
 */
function updateProcessesRankDisplay() {
  for (const [process, element] of processEntities) {
    element.querySelector(".rank")!.innerHTML = "#" + (operatingSystem.processes.indexOf(process) + 1);
  }
}

/**
 * Funtion to update the current solution that the simulation will adapt.
 * The simulation behavior is explained by the OS implementation. 
 */
function updateSolutionDisplay() {
  if (resourceLockingEnabled) {
    if (operatingSystem.processes.length > 0) {
      const process = operatingSystem.processes[0];
      solution.innerHTML = process.context.type === PROCESS_TYPE.READER ? "Reader's Preference Solution" : "Writer's Preference Solution";
    }
  } else {
    solution.innerHTML = "Readers-Writers Problem";
  }
}

/**
 * Function to stop the simulation, managing the OS and the graphical
 * user-interface.
 */
function stopSimulation() {
  operatingSystem.stop();
  controlPlayStopButton.querySelector("span")!.innerHTML = "play_arrow";

  controlClearAllButton.disabled = false;
  controlResetButton.disabled = false;
  controlSolutionToggle.disabled = false;

  for (const [_process, processDOM] of processEntities) {
    processDOM.classList.remove("ready-process", "running-process", "waiting-process", "exit-process");
  }

  preventInteractionsCover.classList.replace("block", "hidden");
}

/**
 * Function to reset the simulation, and by reset it means resetting
 * the files and processes to their initial state, and it includes their DOM
 * counterpart.
 */
function resetSimulation() {
  stopSimulation();
  operatingSystem.reset();
  
  for (const [_process, processDOM] of processEntities) {
    const output = processDOM.querySelector(".output");

    if (output) 
      output.innerHTML = "";
  }

  for (const [file, fileDOM] of fileEntities) {
    file.reset();
    fileDOM.querySelector('.content')!.innerHTML = file.content;
  }
}

/**
 * This is a helper function to count the number of connections there are.
 * @returns the number of connections.
 */
function getConnectionCount() {
  return processEntities.filter(([process]) => process.file).length;
}

/**
 * This is a helper fnction that generates a cryptographically secure random string.
 * @returns random string of given length.
 */
function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (value) => characters[value % characters.length]).join('');
}

/**
 * Event-handler for when the reset button is clicked.
 */
controlResetButton.addEventListener("click", _event => {
  if (operatingSystem.running) return;
  resetSimulation();
});

/**
 * Event handler for when the clear all button is clicked.
 */
controlClearAllButton.addEventListener("click", _event => {
  if (operatingSystem.running) return;
  operatingSystem.processes.splice(0, operatingSystem.processes.length);
  processEntities.splice(0, processEntities.length);
  fileEntities.splice(0, fileEntities.length);

  sandbox.replaceChildren();
  updateCounterDisplay();
  controlPlayStopButton.disabled = true;
});

/**
 * Event-handler for when the play/stop button is clicked.
 */
controlPlayStopButton.addEventListener("click", _event => {
  if (operatingSystem.running) {
    resetSimulation();
    displayManagementPanelContentOverview();
    return;
  }
  
  resetSimulation();
  operatingSystem.start();
  controlPlayStopButton.querySelector("span")!.innerHTML = "stop";

  controlClearAllButton.disabled = true;
  controlResetButton.disabled = true;
  controlSolutionToggle.disabled = true;

  preventInteractionsCover.classList.replace("hidden", "block");
  managementPanelHeaderButtons[2].click();
});

function updateCounterDisplay() {
  counterProcess.innerHTML = `${processEntities.length}/${PROCESS_CAP}`;
  counterFile.innerHTML = `${fileEntities.length}/${FILE_CAP}`;
}

/**
 * Event-handler for when the toggle solution is clicked.
 */
controlSolutionToggle.addEventListener("click", _event => {
  if (operatingSystem.running) return;

  if (resourceLockingEnabled) {
    for (const [file] of fileEntities) {
      file.disableLock();
    }
    controlSolutionToggle.innerHTML = "OS Read-Write Lock Disabled";
  } else {
    for (const [file] of fileEntities) {
      file.enableLock();
    }
    controlSolutionToggle.innerHTML = "OS Read-Write Lock Enabled";
  }

  resourceLockingEnabled = !resourceLockingEnabled;
  updateSolutionDisplay();
});

/**
 * We just want to conveniently track mouse position
 * as necessary.
 */
document.body.addEventListener("mousemove", event => {
  if (!connectThis) return;
  const box = connectionCanvas.getBoundingClientRect();
  let scaleX = connectionCanvas.width / box.width;
  let scaleY = connectionCanvas.height / box.height;

  mousePosition = [
    (event.clientX - box.left) * scaleX,
    (event.clientY - box.top) * scaleY,
  ];
});

/**
 * Event-handler on resize where we ensure that
 * the width, height, and canvas sizes are correct.
 */
window.addEventListener("resize", _event => {
  width = window.innerWidth * 2;
  height = window.innerHeight * 2;
  connectionCanvas.width = width;
  connectionCanvas.height = height;
})

setupConnectionCanvas();
managementPanelHeaderButtons[0].click();