import {Component, h, Prop, Watch, State, Listen} from "@stencil/core";
import "@pie-framework/pie-player-components";

@Component({
    tag: "pie-demo",
    styleUrl: "pie-demo.css",
    shadow: false // TODO - css doesn't work if you use shadow-dom. Investigate.
})
export class PieDemo {
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
    @Prop() model: any;

    @Prop() configure: Object;

    render() {
        let pieName = this.pie
            .substr(this.pie.lastIndexOf("/") + 1, this.pie.length)
            .split("@")[0];

        if (pieName.indexOf("-") < 0) {
            pieName = `x-${pieName}`;
        }
        return <pie-demo-content
            pie={this.pie}
            justElement={this.justElement}
            multiplePies={this.multiplePies}
            modelSchemaJSONURI={this.modelSchemaJSONURI}
            configureSchemaJSONURI={this.configureSchemaJSONURI}
            load={this.load}
            editor={this.editor}
            preview={this.preview}
            playerControls={this.playerControls}
            // model={this.model}
            configure={this.configure}
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
                [this.pie]: this.configure
            }}
        ></pie-demo-content>
    }
}
