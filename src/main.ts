import 'material-icons/iconfont/material-icons.css';
import './style.css';

import OperatingSystem from './class/OperatingSystem';
import Process from './class/Process';
import VirtualFile from './class/VirtualFile';

import { createReadByLetterUnsafe, createReadByWordUnsafe, createWriteLowercaseUnsafe, PROCESS_TYPE, VisualizeContext } from './logical-templates';
import { createManagementPanelContentProcessDOM, createManagementPanelHeaderButtonDOM, createSandboxProcessDOM } from './dom-templates';
import { createReadByLetterSafe, createReadByWordSafe, createWriteLowercaseSafe, createWriteUppercaseSafe } from './logical-templates';

type Entity = Process<any> | VirtualFile;

const operatingSystem = new OperatingSystem<VisualizeContext>((process) => {
  /**
   * 
   */
  process.context.statechange(process);
});

const managementPanelHeader = document.querySelector("#management-panel-header") as HTMLDivElement;
const managementPanelContent = document.querySelector("#management-panel-content") as HTMLDivElement;
const sandbox = document.querySelector("#sandbox") as HTMLDivElement;

let safeMode = true;
let entities: [Entity, HTMLDivElement][] = [];

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
      const generator = safeMode ? safeGenerator : unsafeGenerator;

      // create process dom element here

      const handleConnect = (_event: MouseEvent) => {

      }

      const handleDelete = (_event: MouseEvent) => {
        for (let index = entities.length - 1; index >= 0; --index) {
          if (entities[index][0] === process) entities.splice(index, 1);
        }
        operatingSystem.removeProcess(process);
        processDOM.remove();
      }

      const processDOM = createSandboxProcessDOM(processType, name, handleConnect, handleDelete);
      
      const process = generator(self => {

      });

      operatingSystem.addProcess(process);
      sandbox.appendChild(processDOM);
      entities.push([process, processDOM]);

      // reposition process to center on add
      const rectangle = processDOM.getBoundingClientRect();
      processDOM.style.left = window.innerWidth * 0.5 - rectangle.width * 0.5 + "px";
      processDOM.style.top = window.innerHeight * 0.5 - rectangle.height * 0.5 + "px";
    });

    managementPanelContent.appendChild(button);
  }

}

function displayManagementPanelContentFiles() {
  managementPanelContent.replaceChildren();
}

function displayManagementPanelContentOverview() {
  managementPanelContent.replaceChildren();
}

attachManagementPanelHeaderButtons()[0].click();