/* tslint:disable */
/**
 * This is an autogenerated file created by the Stencil compiler.
 * It contains typing information for all components that exist in this project.
 */


import '@stencil/core';




export namespace Components {

  interface PieDemo {
    'configure': Object;
    /**
    * Include an editor in the view
    */
    'editor': boolean;
    /**
    * JSON objects for the Dev Options menu
    */
    'jsonObjects': object;
    /**
    * Removes control bar if true
    */
    'justElement': boolean;
    /**
    * Tells the component if it needs to load the elements or not
    */
    'load': boolean;
    /**
    * Some functionality
    */
    'loadPies': Function;
    /**
    * The model for the pie.
    */
    'model': Object;
    /**
    * Makes the element have 50% height
    */
    'multiplePies': boolean;
    /**
    * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
    */
    'pie': string;
    /**
    * Include control panel for adjusting player settings.
    */
    'playerControls': boolean;
    /**
    * Include an item preview in the view
    */
    'preview': boolean;
    /**
    * Link to the pie-schema markdown file
    */
    'schemaJSONURI': string;
  }
  interface PieDemoAttributes extends StencilHTMLAttributes {
    'configure'?: Object;
    /**
    * Include an editor in the view
    */
    'editor'?: boolean;
    /**
    * JSON objects for the Dev Options menu
    */
    'jsonObjects'?: object;
    /**
    * Removes control bar if true
    */
    'justElement'?: boolean;
    /**
    * Tells the component if it needs to load the elements or not
    */
    'load'?: boolean;
    /**
    * Some functionality
    */
    'loadPies'?: Function;
    /**
    * The model for the pie.
    */
    'model'?: Object;
    /**
    * Makes the element have 50% height
    */
    'multiplePies'?: boolean;
    /**
    * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
    */
    'pie'?: string;
    /**
    * Include control panel for adjusting player settings.
    */
    'playerControls'?: boolean;
    /**
    * Include an item preview in the view
    */
    'preview'?: boolean;
    /**
    * Link to the pie-schema markdown file
    */
    'schemaJSONURI'?: string;
  }
}

declare global {
  interface StencilElementInterfaces {
    'PieDemo': Components.PieDemo;
  }

  interface StencilIntrinsicElements {
    'pie-demo': Components.PieDemoAttributes;
  }


  interface HTMLPieDemoElement extends Components.PieDemo, HTMLStencilElement {}
  var HTMLPieDemoElement: {
    prototype: HTMLPieDemoElement;
    new (): HTMLPieDemoElement;
  };

  interface HTMLElementTagNameMap {
    'pie-demo': HTMLPieDemoElement
  }

  interface ElementTagNameMap {
    'pie-demo': HTMLPieDemoElement;
  }


  export namespace JSX {
    export interface Element {}
    export interface IntrinsicElements extends StencilIntrinsicElements {
      [tagName: string]: any;
    }
  }
  export interface HTMLAttributes extends StencilHTMLAttributes {}

}
