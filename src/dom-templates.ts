import { PROCESS_TYPE } from "./logical-templates";

/**
 * 
 * @param type 
 * @param name 
 * @returns 
 */
export function createManagementPanelContentProcessDOM(type: PROCESS_TYPE, name: string) {
    const root = document.createElement("button");
    root.className = "flex items-center gap-2 px-2 py-1";

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
    root.className = "absolute select-none cursor-grab border w-[240px] bg-neutral-800 text-white flex flex-wrap group " + (type === PROCESS_TYPE.READER ? "border-gradient-green" : "border-gradient-blue");

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
    connectButton.addEventListener("mousedown", onClickConnect);
    deleteButton.addEventListener("mousedown", onClickDelete);

    root.append(controls);

    let isDragging = false;
    let offsetX: number;
    let offsetY: number;
    const invisibleExpandDrag = document.createElement("div");
    invisibleExpandDrag.className = "w-screen h-screen z-50 fixed top-0 left-0 cursor-grabbing";

    /**
     * 
     */
    root.addEventListener("mousedown", event => {
        isDragging = true;
        offsetX = event.clientX - root.offsetLeft;
        offsetY = event.clientY - root.offsetTop;
        root.style.zIndex = "100";
        invisibleExpandDrag.style.zIndex = "200";
        document.body.appendChild(invisibleExpandDrag);
    });

    /**
     * 
     */
    invisibleExpandDrag.addEventListener('mousemove', event => {
        if (!isDragging) return;
        let resultX = event.clientX - offsetX;
        let resultY = event.clientY - offsetY;
        resultX = Math.max(0, Math.min(resultX, window.innerWidth - 240));
        resultY = Math.max(0, Math.min(resultY, window.innerHeight - 50));
        root.style.left = `${resultX}px`;
        root.style.top = `${resultY}px`;
        onDrag(event, resultX, resultY);
    });

    /**
     * 
     */
    invisibleExpandDrag.addEventListener('mouseup', _event => {
        isDragging = false;
        root.style.removeProperty("z-index");
        document.body.removeChild(invisibleExpandDrag);
    });

    return root;
}

/**
 * 
 * @param name 
 * @param content 
 * @returns 
 */
export function createManagementPanelContentFileDOM(name: string, content: string) {
    const root = document.createElement("div");
    root.className = "none cursor-grab border !w-54 text-xs border-neutral-900 bg-neutral-800/80 text-white flex flex-col items-start group";

    const staticInformation = document.createElement("div");
    staticInformation.className = "p-2 grow-0";

    const filepath = document.createElement("div");
    filepath.className = "bg-neutral-900 px-2 grow-0 rounded-full";
    filepath.innerHTML = name;
    staticInformation.append(filepath);

    const contentContainer = document.createElement("div");
    contentContainer.className = "bg-neutral-900 w-full p-2 group-hover:bg-neutral-900/60";
    contentContainer.innerHTML = content;
    root.append(staticInformation, contentContainer);

    return root;
}


/**
 * 
 * @param name 
 * @param content 
 * @returns 
 */
export function createSandboxFileDOM(name: string, content: string, onDrag: (event: MouseEvent, x: number, y: number) => void, onClickDelete: (event: MouseEvent) => void) {
    const root = document.createElement("div");
    root.className = "absolute select-none cursor-grab border w-[240px] border-neutral-900 bg-neutral-800 text-white flex flex-col items-start group";

    const staticInformation = document.createElement("div");
    staticInformation.className = "p-2 grow-0";

    const filepath = document.createElement("div");
    filepath.className = "bg-neutral-900 px-2 grow-0 rounded-full";
    filepath.innerHTML = name;
    staticInformation.append(filepath);

    const contentContainer = document.createElement("div");
    contentContainer.className = "bg-neutral-900 w-full p-2";
    contentContainer.innerHTML = content;

    //
    const controls = document.createElement("div");
    controls.className = "absolute -right-6 top-1 invisible group-hover:visible z-10 flex flex-col gap-1 *:cursor-pointer";
    //
    const deleteButton = document.createElement("button");
    deleteButton.className = "bg-neutral-800 w-12 h-12 rounded-md flex items-center justify-center border border-neutral-600 hover:bg-neutral-900";

    //
    const deleteIcon = document.createElement("span");
    deleteIcon.className = "material-icons";
    deleteIcon.innerHTML = "delete";
    deleteButton.append(deleteIcon);
    deleteButton.addEventListener("mousedown", onClickDelete);

    controls.append(deleteButton);
    root.append(staticInformation, contentContainer, controls);

    let isDragging = false;
    let offsetX: number;
    let offsetY: number;
    const invisibleExpandDrag = document.createElement("div");
    invisibleExpandDrag.className = "w-screen h-screen z-50 fixed top-0 left-0 cursor-grabbing";

    /**
     * 
     */
    root.addEventListener("mousedown", event => {
        isDragging = true;
        offsetX = event.clientX - root.offsetLeft;
        offsetY = event.clientY - root.offsetTop;
        root.style.zIndex = "100";
        invisibleExpandDrag.style.zIndex = "200";
        document.body.appendChild(invisibleExpandDrag);
    });

    /**
     * 
     */
    invisibleExpandDrag.addEventListener('mousemove', event => {
        if (!isDragging) return;
        let resultX = event.clientX - offsetX;
        let resultY = event.clientY - offsetY;
        resultX = Math.max(0, Math.min(resultX, window.innerWidth - 240));
        resultY = Math.max(0, Math.min(resultY, window.innerHeight - 50));
        root.style.left = `${resultX}px`;
        root.style.top = `${resultY}px`;
        onDrag(event, resultX, resultY);
    });

    /**
     * 
     */
    invisibleExpandDrag.addEventListener('mouseup', _event => {
        isDragging = false;
        root.style.removeProperty("z-index");
        document.body.removeChild(invisibleExpandDrag);
    });

    return root;
}