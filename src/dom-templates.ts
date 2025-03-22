import { PROCESS_TYPE } from "./logical-templates";

/**
 * 
 * @param type 
 * @param name 
 * @returns 
 */
export function createManagementPanelContentProcessDOM(type: PROCESS_TYPE, name: string) {
    const root = document.createElement("button");
    root.className = "flex items-center gap-2";

    //
    const mark = document.createElement("div");
    mark.className = "text-xs px-2 py-1 rounded-xl " + (type === PROCESS_TYPE.READER ? "bg-green-500" : "bg-blue-500");
    mark.innerHTML = (type === PROCESS_TYPE.READER ? "Reader" : "Writer");

    //
    const label = document.createElement("div");
    label.innerHTML = name;

    //
    root.append(mark);
    root.append(label);

    return root;
}

/**
 * 
 * @param name 
 * @returns 
 */
export function createManagementPanelHeaderButtonDOM(name: string) {
    const root = document.createElement("button");
    root.innerHTML = name;
    return root;
}

/**
 * 
 * @param type 
 * @param name 
 * @param onClickConnect 
 * @param onClickDelete 
 * @param onDrag 
 * @returns 
 */
export function createSandboxProcessDOM(type: PROCESS_TYPE, name: string, onClickConnect: (event: MouseEvent) => void, onClickDelete: (event: MouseEvent) => void, onDrag: (event: MouseEvent, x: number, y: number) => void) {
    const root = document.createElement("div");
    root.className = "absolute select-none cursor-grab border-gradient-green border w-72 bg-neutral-800/90 text-white flex flex-wrap group";

    //
    const staticInformation = document.createElement("div");
    staticInformation.className = "py-4 px-2 flex gap-2 grow";
    
    //
    const mark = document.createElement("div");
    mark.className = "text-sm px-2 py-1 rounded-full " + (type === PROCESS_TYPE.READER ? "bg-green-500" : "bg-blue-500");
    mark.innerHTML = (type === PROCESS_TYPE.READER ? "Reader" : "Writer");

    //
    const label = document.createElement("div");
    label.innerHTML = name;

    const rank = document.createElement("div");
    rank.className = "rank text-sm flex px-2 ml-auto justify-center items-center rounded-xl bg-neutral-900";
    rank.innerHTML = "#0";

    staticInformation.append(mark, label, rank);
    root.append(staticInformation);

    //
    if (type === PROCESS_TYPE.READER) {
        const output = document.createElement("div");
        output.className = "w-full p-3 bg-neutral-900 rounded-b-md";
        output.innerHTML = "Output: ";

        const actualOutput = document.createElement("span");
        actualOutput.className = "output";
        output.append(actualOutput);
        root.append(output);
    }

    //
    const controls = document.createElement("div");
    controls.className = "absolute -right-6 top-1 invisible group-hover:visible z-10 flex flex-col gap-1 *:cursor-pointer";

    //
    const connectButton = document.createElement("button");
    connectButton.className = "bg-neutral-800 w-12 h-12 rounded-md flex items-center justify-center border border-neutral-600 hover:bg-neutral-900";
    
    //
    const connectIcon = document.createElement("span");
    connectIcon.className = "material-icons";
    connectIcon.innerHTML = "link";
    connectButton.append(connectIcon);

    //
    const deleteButton = document.createElement("button");
    deleteButton.className = "bg-neutral-800 w-12 h-12 rounded-md flex items-center justify-center border border-neutral-600 hover:bg-neutral-900";
    
    //
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "material-icons";
    deleteIcon.innerHTML = "delete";
    deleteButton.append(deleteIcon);

    controls.append(connectButton, deleteButton);

    //
    connectButton.addEventListener("click", onClickConnect);
    deleteButton.addEventListener("click", onClickDelete);

    root.append(controls);

    let isDragging = false;
    let offsetX: number;
    let offsetY: number;

    /**
     * 
     */
    root.addEventListener("mousedown", event => {
        isDragging = true;
        offsetX = event.clientX - root.offsetLeft;
        offsetY = event.clientY - root.offsetTop;
        root.style.zIndex = "100";
        root.style.cursor = "grabbing";
    });

    /**
     * 
     */
    root.addEventListener('mousemove', event => {
        if (!isDragging) return;
        const resultX = event.clientX - offsetX;
        const resultY = event.clientY - offsetY;
        root.style.left = `${resultX}px`;
        root.style.top = `${resultY}px`;
        onDrag(event, resultX, resultY);
    
    });

    /**
     * 
     */
    root.addEventListener('mouseup', _event => {
        isDragging = false;
        root.style.removeProperty("cursor");
        root.style.removeProperty("z-index");
    });
    
    return root;
}