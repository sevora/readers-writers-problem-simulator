import 'material-icons/iconfont/material-icons.css';
import './style.css';

import OperatingSystem from './class/OperatingSystem';
import Process, { PROCESS_STATE } from './class/Process';
import VirtualFile from './class/VirtualFile';

import { createNietzscheFile, createCaesarFile, createEinsteinFile, createPangramFile, PROCESS_TYPE, VisualizeContext, createShakespeareFile } from './logical-templates';
import { createManagementPanelContentFileDOM, createManagementPanelContentProcessDOM, createManagementPanelHeaderButtonDOM, createSandboxFileDOM, createSandboxProcessDOM } from './dom-templates';
import { createReadByLetter, createReadByWord, createWriteLowercase, createWriteUppercase } from './logical-templates';

const operatingSystem = new OperatingSystem<VisualizeContext>((process) => {
  /**
   * 
   */
  if (process.context.statechange)
    process.context.statechange(process);
});

const managementPanelHeader = document.querySelector("#management-panel-header") as HTMLDivElement;
const managementPanelContent = document.querySelector("#management-panel-content") as HTMLDivElement;
const managementPanelHeaderButtons = attachManagementPanelHeaderButtons();
const controlPlayPauseButton = document.querySelector("#control-play-pause") as HTMLButtonElement;
const controlResetButton = document.querySelector("#control-reset") as HTMLButtonElement;
const controlClearAllButton = document.querySelector("#control-clear-all") as HTMLButtonElement;
const counterProcess = document.querySelector("#counter-process") as HTMLDivElement;
const counterFile = document.querySelector("#counter-file") as HTMLDivElement;
const sandbox = document.querySelector("#sandbox") as HTMLDivElement;
const preventInteractionsCover = document.querySelector("#prevent-interactions-cover") as HTMLDivElement;
const connectionCanvas = document.querySelector("#connection-canvas") as HTMLCanvasElement;
const connectionCanvasContext = connectionCanvas.getContext("2d")!;

const PROCESS_CAP = 5;
const FILE_CAP = 5;

let safeMode = true;
let connectThis: [Process<VisualizeContext>, HTMLDivElement] | undefined;
let now = Date.now();
let then = now;
let fps = 60;
let interval = 1000 / fps;
let width = window.innerWidth * 2;
let height = window.innerHeight * 2;
let mousePosition: [number, number] | undefined = undefined;

let processEntities: [Process<VisualizeContext>, HTMLDivElement][] = [];
let fileEntities: [VirtualFile, HTMLDivElement][] = [];

/**
 * 
 */
function setupConnectionCanvas() {
  connectionCanvas.width = width;
  connectionCanvas.height = height;
  loopConnectionCanvas();
}

/**
 * 
 */
function loopConnectionCanvas() {
  window.requestAnimationFrame(loopConnectionCanvas);
        
  now = Date.now();
  let elapsed = now - then;

  if (elapsed > interval) {
      then = now - (elapsed % interval);
      updateConnectionCanvas();
  }
}

/**
 * 
 */
function updateConnectionCanvas() {
  const context = connectionCanvasContext;
  context.clearRect(0, 0, width, height);

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

  for (const [process, processElement]  of processEntities) {
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
        context.globalAlpha = (process.state === PROCESS_STATE.RUNNING || !operatingSystem.running) ? 1.0 : 0.25;

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
 * 
 */
function clearManagementPanelHeaderSelection() {
  for (const child of managementPanelHeader.children) {
    child.className = "";
  }
}

/**
 * 
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
 * 
 */
function displayManagementPanelContentProcesses() {
  managementPanelContent.replaceChildren();

  const processGenerators = [
    ["Read by letter", PROCESS_TYPE.READER, createReadByLetter],
    ["Read by word", PROCESS_TYPE.READER, createReadByWord],
    ["Write to uppercase", PROCESS_TYPE.WRITER, createWriteUppercase],
    ["Write to lowercase", PROCESS_TYPE.WRITER, createWriteLowercase]
  ] as const

  for (let index = 0; index < processGenerators.length; ++index) {
    const [name, processType, generator] = processGenerators[index];
    const button = createManagementPanelContentProcessDOM(processType, name);

    button.addEventListener("click", function (_event) {
      if (processEntities.length + 1 > PROCESS_CAP) return;

      // create process dom element here
      const handleConnect = (_event: MouseEvent) => {
        if (process.file || connectThis) {
          connectThis = undefined;
          mousePosition = undefined;
          process.disconnect();
          return;
        }

        connectThis = [process, processDOM];
      }

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
      }

      const handleDrag = (_event: MouseEvent, _x: number, y: number) => {
        operatingSystem.setPriority(process, -y);
        updateProcessesDisplayRank();
      }

      
      const adjustedName = `${name} (${generateRandomString(3)})`;
      const processDOM = createSandboxProcessDOM(processType, adjustedName, handleConnect, handleDelete, handleDrag);
      const process = generator();

      process.context.statechange = (self) => {

      }

      operatingSystem.addProcess(process);
      sandbox.appendChild(processDOM);
      processEntities.push([process, processDOM]);

      // reposition process to center on add
      const rectangle = processDOM.getBoundingClientRect();
      const centerY = window.innerHeight * 0.5 - rectangle.height * 0.5;
      processDOM.style.left = window.innerWidth * 0.5 - rectangle.width * 0.5 + "px";
      processDOM.style.top = centerY + "px";
      operatingSystem.setPriority(process, -centerY);
      
      updateCounterDisplay();
      updateProcessesDisplayRank();
    });

    managementPanelContent.appendChild(button);
  }

}

/**
 * 
 */
function updateProcessesDisplayRank() {
  for (const [process, element] of processEntities) {
    element.querySelector(".rank")!.innerHTML = "#" + (operatingSystem.processes.indexOf(process) + 1);
  }
}

/**
 * 
 */
function displayManagementPanelContentFiles() {
  managementPanelContent.replaceChildren();

  const fileGenerators = [
    createCaesarFile,
    createEinsteinFile,
    createNietzscheFile,
    createPangramFile,
    createShakespeareFile
  ];

  for (let index = 0; index < fileGenerators.length; ++index) {
    const generator = fileGenerators[index]
    const { filename, content } = generator();
    const button = createManagementPanelContentFileDOM(filename, content);

    button.addEventListener("click", function(_event) {
      if (fileEntities.length + 1 > PROCESS_CAP) return;
      const file = generator();

      const handleDelete = (_event: MouseEvent) => {
        
        for (const [process] of processEntities) {
          if (process.file === file) {
            process.disconnect();
          }
        }
        
        for (let index = fileEntities.length-1; index >= 0; --index) {
          if (fileEntities[index][0] === file) {
            fileEntities.splice(index, 1);
            break;
          }
        }

        fileDOM.remove();
      }

      const adjustedFilename = filename.split(".").map(
        (value, index) => {
          if (index === 0)
            return value + "_" + generateRandomString(3) 
          return value;
        }
      ).join('.');
  
      const fileDOM = createSandboxFileDOM(adjustedFilename, content, handleDelete);

      fileDOM.addEventListener("mousedown", _event => {
        if (!connectThis) return;
        const process = connectThis[0];
        process.connect(file);
        connectThis = undefined;
        mousePosition = undefined;
      });

      file.statechange = (self) => {

      }

      sandbox.appendChild(fileDOM);
      fileEntities.push([file, fileDOM]);

      const rectangle = fileDOM.getBoundingClientRect();
      const centerY = window.innerHeight * 0.5 - rectangle.height * 0.5;
      fileDOM.style.left = window.innerWidth * 0.5 - rectangle.width * 0.5 + "px";
      fileDOM.style.top = centerY + "px";

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
}

/**
 * 
 */
controlResetButton.addEventListener("click", _event => {
  operatingSystem.reset();
  // update dom to disconnect everything
});

/**
 * 
 */
controlClearAllButton.addEventListener("click", _event => {
  operatingSystem.stop();
  operatingSystem.processes.splice(0, operatingSystem.processes.length);

  sandbox.replaceChildren();
  processEntities.splice(0, processEntities.length);
  updateCounterDisplay();
});

/**
 * 
 */
controlPlayPauseButton.addEventListener("click", _event => {
  if (operatingSystem.running) {
    operatingSystem.stop();
    controlPlayPauseButton.querySelector("span")!.innerHTML = "play_arrow";
    preventInteractionsCover.classList.replace("block", "hidden");
    return;
  }
  
  operatingSystem.start();
  controlPlayPauseButton.querySelector("span")!.innerHTML = "pause";
  preventInteractionsCover.classList.replace("hidden", "block");
  managementPanelHeaderButtons[2].click();  
});

function updateCounterDisplay() {
  counterProcess.innerHTML = `${processEntities.length}/${PROCESS_CAP}`;
  counterFile.innerHTML = `${fileEntities.length}/${FILE_CAP}`;
}

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

function generateRandomString(length: number) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, (num) => characters[num % characters.length]).join('');
}

setupConnectionCanvas();
managementPanelHeaderButtons[0].click();