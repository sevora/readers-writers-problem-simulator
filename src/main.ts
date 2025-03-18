import 'material-icons/iconfont/material-icons.css';
import './style.css';

import OperatingSystem from './class/OperatingSystem';
import { VisualizeContext } from './process-generator';

const operatingSystem = new OperatingSystem<VisualizeContext>((process) => {
  process.context.statechange(process);
});