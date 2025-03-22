import 'material-icons/iconfont/material-icons.css';
import './style.css';

import OperatingSystem from './class/OperatingSystem';
import Process from './class/Process';
import VirtualFile from './class/VirtualFile';

import { createReadByLetterUnsafe, createReadByWordUnsafe, createWriteLowercaseUnsafe, PROCESS_TYPE, VisualizeContext } from './logical-templates';
import { createManagementPanelContentProcessDOM, createManagementPanelHeaderButtonDOM, createSandboxProcessDOM } from './dom-templates';
import { createReadByLetterSafe, createReadByWordSafe, createWriteLowercaseSafe, createWriteUppercaseSafe } from './logical-templates';

const operatingSystem = new OperatingSystem<VisualizeContext>((process) => {
  /**
   * 
   */
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

const PROCESS_CAP = 6;
const FILE_CAP = 6;

let safeMode = true;
let processEntities: [Process<VisualizeContext>, HTMLDivElement][] = [];
let fileEntities: [VirtualFile, HTMLDivElement][] = [];

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
    ["Read by letter", PROCESS_TYPE.READER, createReadByLetterSafe, createReadByLetterUnsafe],
    ["Read by word", PROCESS_TYPE.READER, createReadByWordSafe, createReadByWordUnsafe],
    ["Write to uppercase", PROCESS_TYPE.WRITER, createWriteUppercaseSafe, createWriteLowercaseUnsafe],
    ["Write to lowercase", PROCESS_TYPE.WRITER, createWriteLowercaseSafe, createWriteLowercaseSafe]
  ] as const;

  for (let index = 0; index < processGenerators.length; ++index) {
    const [name, processType, safeGenerator, unsafeGenerator] = processGenerators[index];
    const button = createManagementPanelContentProcessDOM(processType, name);

    button.addEventListener("click", function (_event) {
      if (processEntities.length + 1 > PROCESS_CAP) return;
      const generator = safeMode ? safeGenerator : unsafeGenerator;

      // create process dom element here

      const handleConnect = (_event: MouseEvent) => {

      }

      const handleDelete = (_event: MouseEvent) => {
        for (let index = processEntities.length - 1; index >= 0; --index) {
          if (processEntities[index][0] === process) processEntities.splice(index, 1);
        }
        operatingSystem.removeProcess(process);
        processDOM.remove();
        updateCounterDisplay();
      }

      const handleDrag = (_event: MouseEvent, _x: number, y: number) => {
        operatingSystem.setPriority(process, -y);
        updateProcessesDisplayRank();
      }

      const processDOM = createSandboxProcessDOM(processType, name, handleConnect, handleDelete, handleDrag);
      
      const process = generator(self => {

      });

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

managementPanelHeaderButtons[0].click();