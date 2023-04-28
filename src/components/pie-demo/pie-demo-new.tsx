import {Component, h, Prop} from "@stencil/core";
import "@pie-framework/pie-player-components";
import {PieModel} from "@pie-framework/pie-player-components/dist/types/interface";
import {getPackageWithoutVersion} from "../../util/utils";

/**
 * This component tries to add multi-items support.
 * It uses many parts from the old component (pie-demo) but also has some pretty big changes
 * Instead of removing the old component, we'll keep it in case the new component
 * breaks, to be able to switch quickly between them
 * The long-term purpose is to support multi-items, I guess, but for now (the reason I started this)
 *    teh purpose was to be able to test complex-rubric integrations
 * The documentation for each item is still item-type oriented now (not multi-item)
 *    ex: math-inline in pie-website will only have math-inline documentation, even if it has multiple item types
**/

@Component({
  tag: "pie-demo",
  styleUrl: "pie-demo.css",
  shadow: false // TODO - css doesn't work if you use shadow-dom. Investigate.
})
export class PieDemoNew {
  /**
   * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
   */
  @Prop() pie: string;

  /**
   * Removes control bar if true
   * @type {boolean}
   */
  @Prop() justElement: boolean = false;

  /**
   * Makes the element have 50% height
   * @type {boolean}
   */
  @Prop() multiplePies: boolean = false;

  /**
   * Link to the pie-schema markdown file
   * @type {boolean}
   */
  @Prop() modelSchemaJSONURI: string = null;

  /**
   * Link to the pie-schema markdown file
   * @type {boolean}
   */
  @Prop() configureSchemaJSONURI: string = null;

  /**
   * Tells the component if it needs to load the elements or not
   */
  @Prop() load: boolean = true;
  /**
   * Include an editor in the view
   */
  @Prop() editor: boolean = true;
  /**
   * Include an item preview in the view
   */

  @Prop() preview: boolean = true;
  /**
   * Include control panel for adjusting player settings.
   */
  @Prop() playerControls: boolean = true;

  /**
   * The model for the pie.
   */
  @Prop() model: PieModel;

  @Prop() configure: Object;

  render() {
    let pieName = this.pie
        .substr(this.pie.lastIndexOf("/") + 1, this.pie.length)
        .split("@")[0];

    if (pieName.indexOf("-") < 0) {
      pieName = `x-${pieName}`;
    }
    const packageWithoutVersion = getPackageWithoutVersion(this.pie);

    return <pie-demo-content
        justElement={this.justElement}
        multiplePies={this.multiplePies}
        modelSchemaJSONURI={this.modelSchemaJSONURI}
        configureSchemaJSONURI={this.configureSchemaJSONURI}
        load={this.load}
        editor={this.editor}
        preview={this.preview}
        playerControls={this.playerControls}
        config={{
          id: "1",
          elements: {
            [pieName]: this.pie
          },
          models: [
            this.model
          ],
          markup: `<${pieName} id='1'></${pieName}>`
        }}
        configSettings={{
          [packageWithoutVersion]: this.configure
        }}
    ></pie-demo-content>
  }
}
