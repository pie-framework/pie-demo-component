
// PieDemo: Custom Elements Define Library, ES Module/es5 Target

import { defineCustomElement } from './pie-demo.core.js';
import {
  PieDemo
} from './pie-demo.components.js';

export function defineCustomElements(win, opts) {
  return defineCustomElement(win, [
    PieDemo
  ], opts);
}
