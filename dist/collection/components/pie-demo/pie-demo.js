import { loadCloudPies } from '../../util/PieCloud';
import classnames from 'classnames';
var ViewState;
(function (ViewState) {
    ViewState[ViewState["LOADING"] = 0] = "LOADING";
    ViewState[ViewState["READY"] = 1] = "READY";
    ViewState[ViewState["ERROR"] = 2] = "ERROR";
})(ViewState || (ViewState = {}));
export class PieDemo {
    constructor() {
        /**
         * Tells the component if it needs to load the elements or not
         */
        this.load = true;
        /**
         * Include an editor in the view
         */
        this.editor = true;
        /**
         * Include an item preview in the view
         */
        this.preview = true;
        /**
         * Include control panel for adjusting player settings.
         */
        this.playerControls = true;
        this.state = ViewState.LOADING;
        this.toggled = this.preview;
        this.env = { mode: 'gather' };
        this.session = {};
        // @Element() private element: HTMLElement
        /**
         * Some functionality
         */
        this.loadPies = (elements) => {
            loadCloudPies(elements, document);
        };
    }
    toggleEditor() {
        this.toggled = !this.toggled;
    }
    watchPie(newPie) {
        console.log('pie-watch triggered');
        this.package = newPie;
        this.pieName = newPie.substr(newPie.lastIndexOf('/') + 1, newPie.length).split('@')[0];
        if (this.pieName.indexOf('-') < 0) {
            this.pieName = `x-${this.pieName}`;
        }
        customElements.whenDefined(this.pieName).then(async () => {
            // TODO - what if same element reloaded, could elems be redefined? may need to undefine prior?
            const packageWithoutVersion = this.package.replace(/(?<=[a-z])\@(?:.(?!\@))+$/, '');
            this.pieController = window['pie'].default[packageWithoutVersion].controller;
            this.updatePieModelFromController(this.model, this.session, this.env);
            this.state = ViewState.READY;
        });
        if (this.load) {
            loadCloudPies({ [this.pieName]: this.package }, document);
        }
    }
    async updateModel(newModel) {
        if (window['pie']) {
            console.log('model property updated');
            this.configModel = newModel;
        }
    }
    async watchConfigModel(newModel) {
        if (this.configElement)
            this.configElement.model = newModel;
        this.updatePieModelFromController(newModel, this.session, this.env);
    }
    async updatePieModelFromController(model, session, env) {
        if (this.pieController) {
            this.pieElementModel = await this.pieController.model(model, session, env);
            if (this.pieElement) {
                this.pieElement.model = this.pieElementModel;
            }
        }
    }
    watchPieElementModel(newModel) {
        if (this.pieElement) {
            this.pieElement.model = newModel;
        }
    }
    componentWillLoad() {
        console.log('component will load ... ');
        this.watchPie(this.pie);
        if (this.model) {
            this.updateModel(this.model);
        }
    }
    componentWillUpdate() {
        console.log('component will update ... ');
    }
    wachConfigElement(newEl) {
        newEl && newEl.addEventListener('model.updated', (event) => {
            console.log('model.updated');
            this.configModel = event.detail && event.detail.update;
            this.updatePieModelFromController(this.configModel, this.session, this.env);
        });
    }
    setMode(mode) {
        this.env['mode'] = mode;
        this.updatePieModelFromController(this.configModel, this.session, this.env);
    }
    customCheckBox({ label, checked, value }) {
        return (h("label", { class: "custom-checkbox", onClick: () => this.setMode(value) },
            h("span", { class: classnames("circle-container", {
                    'full': checked
                }) },
                h("i", { "data-value": value, class: "circle" })),
            h("span", null, label)));
    }
    render() {
        switch (this.state) {
            case ViewState.LOADING:
                return h("div", { id: "loading" }, "Loading...");
            case ViewState.ERROR:
                return h("div", { id: "error" }, "Error...");
            case ViewState.READY:
                console.log('rendering');
                const Tagname = this.pieName;
                const ConfigTag = this.pieName + '-config';
                return (h("div", { class: "root" },
                    h("span", { class: "control-bar" },
                        h("div", { class: classnames('authoring-header', {
                                'collapsed': !this.toggled
                            }) },
                            h("h4", null, "Authoring View"),
                            h("i", { class: classnames('fa', {
                                    'fa-caret-left': this.toggled,
                                    'fa-caret-right': !this.toggled
                                }), onClick: () => this.toggleEditor() })),
                        h("div", { class: "student-view-header" },
                            h("h4", null, "Student View"))),
                    h("div", { class: "config-holder" },
                        h("div", { class: "authoring-holder", style: { "display": this.toggled ? 'block' : 'none' } },
                            h(ConfigTag, { id: "configure", ref: el => (this.configElement = el), model: this.model, session: this.session })),
                        h("div", { class: "student-view-holder" },
                            h("div", { class: "mode-config" },
                                h("h5", null, "Mode"),
                                h("div", { class: "modes-holder" },
                                    this.customCheckBox({
                                        label: 'Gather',
                                        checked: this.env['mode'] === 'gather',
                                        value: 'gather'
                                    }),
                                    this.customCheckBox({
                                        label: 'View',
                                        checked: this.env['mode'] === 'view',
                                        value: 'view'
                                    }),
                                    this.customCheckBox({
                                        label: 'Evaluate',
                                        checked: this.env['mode'] === 'evaluate',
                                        value: 'evaluate'
                                    }))),
                            h(Tagname, { id: "render", ref: el => {
                                    console.log('Setare');
                                    (this.pieElement = el);
                                }, model: this.pieElementModel, session: this.session })))));
        }
    }
    static get is() { return "pie-demo"; }
    static get properties() { return {
        "configElement": {
            "state": true,
            "watchCallbacks": ["wachConfigElement"]
        },
        "configModel": {
            "state": true,
            "watchCallbacks": ["watchConfigModel"]
        },
        "editor": {
            "type": Boolean,
            "attr": "editor"
        },
        "env": {
            "state": true
        },
        "load": {
            "type": Boolean,
            "attr": "load"
        },
        "loadPies": {
            "type": "Any",
            "attr": "load-pies"
        },
        "model": {
            "type": "Any",
            "attr": "model",
            "watchCallbacks": ["updateModel"]
        },
        "package": {
            "state": true
        },
        "pie": {
            "type": String,
            "attr": "pie",
            "watchCallbacks": ["watchPie"]
        },
        "pieController": {
            "state": true
        },
        "pieElement": {
            "state": true
        },
        "pieElementModel": {
            "state": true,
            "watchCallbacks": ["watchPieElementModel"]
        },
        "pieName": {
            "state": true
        },
        "playerControls": {
            "type": Boolean,
            "attr": "player-controls"
        },
        "preview": {
            "type": Boolean,
            "attr": "preview"
        },
        "session": {
            "state": true
        },
        "state": {
            "state": true
        },
        "toggled": {
            "state": true
        }
    }; }
    static get style() { return "/**style-placeholder:pie-demo:**/"; }
}
