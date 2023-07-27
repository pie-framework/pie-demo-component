/* eslint-disable */
/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */
import { HTMLStencilElement, JSXBase } from "@stencil/core/internal";
import { ItemConfig, PieModel } from "@pie-framework/pie-player-components/dist/types/interface";
export namespace Components {
    interface PieDemo {
        "configure": Object;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "configureSchemaJSONURI": string;
        /**
          * Include an editor in the view
         */
        "editor": boolean;
        /**
          * Removes control bar if true
          * @type {boolean}
         */
        "justElement": boolean;
        /**
          * Tells the component if it needs to load the elements or not
         */
        "load": boolean;
        /**
          * The model for the pie.
         */
        "model": PieModel;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "modelSchemaJSONURI": string;
        /**
          * Makes the element have 50% height
          * @type {boolean}
         */
        "multiplePies": boolean;
        /**
          * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
         */
        "pie": string;
        /**
          * Include control panel for adjusting player settings.
         */
        "playerControls": boolean;
        /**
          * Include an item preview in the view
         */
        "preview": boolean;
    }
    interface PieDemoContent {
        "config": ItemConfig;
        "configSettings": {
    [key: string]: Object;
  };
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "configureSchemaJSONURI": string;
        /**
          * Include an editor in the view
         */
        "editor": boolean;
        /**
          * Removes control bar if true
          * @type {boolean}
         */
        "justElement": boolean;
        /**
          * Tells the component if it needs to load the elements or not
         */
        "load": boolean;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "modelSchemaJSONURI": string;
        /**
          * Makes the element have 50% height
          * @type {boolean}
         */
        "multiplePies": boolean;
        /**
          * Include control panel for adjusting player settings.
         */
        "playerControls": boolean;
        /**
          * Include an item preview in the view
         */
        "preview": boolean;
    }
    interface PieDemoOld {
        "configure": Object;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "configureSchemaJSONURI": string;
        /**
          * Include an editor in the view
         */
        "editor": boolean;
        /**
          * Removes control bar if true
          * @type {boolean}
         */
        "justElement": boolean;
        /**
          * Tells the component if it needs to load the elements or not
         */
        "load": boolean;
        /**
          * The model for the pie.
         */
        "model": Object;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "modelSchemaJSONURI": string;
        /**
          * Makes the element have 50% height
          * @type {boolean}
         */
        "multiplePies": boolean;
        /**
          * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
         */
        "pie": string;
        /**
          * Include control panel for adjusting player settings.
         */
        "playerControls": boolean;
        /**
          * Include an item preview in the view
         */
        "preview": boolean;
    }
}
declare global {
    interface HTMLPieDemoElement extends Components.PieDemo, HTMLStencilElement {
    }
    var HTMLPieDemoElement: {
        prototype: HTMLPieDemoElement;
        new (): HTMLPieDemoElement;
    };
    interface HTMLPieDemoContentElement extends Components.PieDemoContent, HTMLStencilElement {
    }
    var HTMLPieDemoContentElement: {
        prototype: HTMLPieDemoContentElement;
        new (): HTMLPieDemoContentElement;
    };
    interface HTMLPieDemoOldElement extends Components.PieDemoOld, HTMLStencilElement {
    }
    var HTMLPieDemoOldElement: {
        prototype: HTMLPieDemoOldElement;
        new (): HTMLPieDemoOldElement;
    };
    interface HTMLElementTagNameMap {
        "pie-demo": HTMLPieDemoElement;
        "pie-demo-content": HTMLPieDemoContentElement;
        "pie-demo-old": HTMLPieDemoOldElement;
    }
}
declare namespace LocalJSX {
    interface PieDemo {
        "configure"?: Object;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "configureSchemaJSONURI"?: string;
        /**
          * Include an editor in the view
         */
        "editor"?: boolean;
        /**
          * Removes control bar if true
          * @type {boolean}
         */
        "justElement"?: boolean;
        /**
          * Tells the component if it needs to load the elements or not
         */
        "load"?: boolean;
        /**
          * The model for the pie.
         */
        "model"?: PieModel;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "modelSchemaJSONURI"?: string;
        /**
          * Makes the element have 50% height
          * @type {boolean}
         */
        "multiplePies"?: boolean;
        /**
          * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
         */
        "pie"?: string;
        /**
          * Include control panel for adjusting player settings.
         */
        "playerControls"?: boolean;
        /**
          * Include an item preview in the view
         */
        "preview"?: boolean;
    }
    interface PieDemoContent {
        "config"?: ItemConfig;
        "configSettings"?: {
    [key: string]: Object;
  };
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "configureSchemaJSONURI"?: string;
        /**
          * Include an editor in the view
         */
        "editor"?: boolean;
        /**
          * Removes control bar if true
          * @type {boolean}
         */
        "justElement"?: boolean;
        /**
          * Tells the component if it needs to load the elements or not
         */
        "load"?: boolean;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "modelSchemaJSONURI"?: string;
        /**
          * Makes the element have 50% height
          * @type {boolean}
         */
        "multiplePies"?: boolean;
        /**
          * Include control panel for adjusting player settings.
         */
        "playerControls"?: boolean;
        /**
          * Include an item preview in the view
         */
        "preview"?: boolean;
    }
    interface PieDemoOld {
        "configure"?: Object;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "configureSchemaJSONURI"?: string;
        /**
          * Include an editor in the view
         */
        "editor"?: boolean;
        /**
          * Removes control bar if true
          * @type {boolean}
         */
        "justElement"?: boolean;
        /**
          * Tells the component if it needs to load the elements or not
         */
        "load"?: boolean;
        /**
          * The model for the pie.
         */
        "model"?: Object;
        /**
          * Link to the pie-schema markdown file
          * @type {boolean}
         */
        "modelSchemaJSONURI"?: string;
        /**
          * Makes the element have 50% height
          * @type {boolean}
         */
        "multiplePies"?: boolean;
        /**
          * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
         */
        "pie"?: string;
        /**
          * Include control panel for adjusting player settings.
         */
        "playerControls"?: boolean;
        /**
          * Include an item preview in the view
         */
        "preview"?: boolean;
    }
    interface IntrinsicElements {
        "pie-demo": PieDemo;
        "pie-demo-content": PieDemoContent;
        "pie-demo-old": PieDemoOld;
    }
}
export { LocalJSX as JSX };
declare module "@stencil/core" {
    export namespace JSX {
        interface IntrinsicElements {
            "pie-demo": LocalJSX.PieDemo & JSXBase.HTMLAttributes<HTMLPieDemoElement>;
            "pie-demo-content": LocalJSX.PieDemoContent & JSXBase.HTMLAttributes<HTMLPieDemoContentElement>;
            "pie-demo-old": LocalJSX.PieDemoOld & JSXBase.HTMLAttributes<HTMLPieDemoOldElement>;
        }
    }
}
