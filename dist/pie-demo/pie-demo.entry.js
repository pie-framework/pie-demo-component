/*! Built with http://stenciljs.com */
const { h } = window.PieDemo;

/**
 *
 * @param {Object<string,string>} elements elements to load from pie cloud service
 * @param {HTMLDocument} doc - the document to load the scripts
 * @param {string} base_url - default base url for cloud service
 */
function loadCloudPies(elements, doc, base_url = 'https://pits-dot-kds-production-216220.appspot.com/bundles/') {
    const head = doc.getElementsByTagName('head')[0];
    const keys = Object.keys(elements);
    for (const key in keys) {
        const elementName = keys[key];
        const npmPackage = elements[elementName];
        const packageWithoutVersion = npmPackage.replace(/(?<=[a-z])\@(?:.(?!\@))+/g, '');
        const script = doc.createElement('script');
        const onloadFn = (_package => {
            return () => {
                const packages = _package.split('+');
                const elementsName = elementName.split('+');
                packages.forEach((pack, index) => {
                    const pie = window['pie'].default[pack];
                    const elName = elementsName[index];
                    console.log('defining elements');
                    if (!customElements.get(elName)) {
                        customElements.define(elName, pie.Element);
                        customElements.define(elName + '-config', pie.Configure);
                    }
                });
            };
        })(packageWithoutVersion);
        script.id = elementName;
        script.onload = onloadFn;
        script.src = base_url + npmPackage + '/editor.js';
        head.appendChild(script);
    }
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var classnames = createCommonjsModule(function (module) {
/*!
  Copyright (c) 2017 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/
/* global define */

(function () {

	var hasOwn = {}.hasOwnProperty;

	function classNames () {
		var classes = [];

		for (var i = 0; i < arguments.length; i++) {
			var arg = arguments[i];
			if (!arg) continue;

			var argType = typeof arg;

			if (argType === 'string' || argType === 'number') {
				classes.push(arg);
			} else if (Array.isArray(arg) && arg.length) {
				var inner = classNames.apply(null, arg);
				if (inner) {
					classes.push(inner);
				}
			} else if (argType === 'object') {
				for (var key in arg) {
					if (hasOwn.call(arg, key) && arg[key]) {
						classes.push(key);
					}
				}
			}
		}

		return classes.join(' ');
	}

	if (module.exports) {
		classNames.default = classNames;
		module.exports = classNames;
	} else {
		window.classNames = classNames;
	}
}());
});

var ViewState;
(function (ViewState) {
    ViewState[ViewState["LOADING"] = 0] = "LOADING";
    ViewState[ViewState["READY"] = 1] = "READY";
    ViewState[ViewState["ERROR"] = 2] = "ERROR";
})(ViewState || (ViewState = {}));
class PieDemo {
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
    static get style() { return "\@import url(\"https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css\");\n\n.control-bar {\n    color: grey;\n    display: -ms-flexbox;\n    display: flex;\n    font-size: 16px;\n    font-weight: bold;\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n    width: 100%;\n}\n\n.control-bar .authoring-header {\n    border-bottom: solid 1px #DB563B;\n    -ms-flex: 1;\n    flex: 1;\n    margin-right: 30px;\n    position: relative;\n}\n\n.control-bar .authoring-header.collapsed {\n    max-width: 20px;\n}\n\n.control-bar .authoring-header.collapsed h4 {\n    display: none;\n}\n\n.control-bar .authoring-header i {\n    position: absolute;\n    top: 0;\n    right: 0;\n}\n\n.control-bar .student-view-header {\n    border-bottom: solid 1px #DB563B;\n    -ms-flex: 1 0 0px;\n    flex: 1 0 0;\n}\n\n.authoring-holder {\n    -ms-flex: 1 0 0px;\n    flex: 1 0 0;\n    margin-right: 30px;\n}\n\n.root {\n    border: green;\n}\n\n.config-holder {\n    display: -ms-flexbox;\n    display: flex;\n    padding-bottom: 20px;\n    padding-top: 20px;\n    width: 100%;\n}\n\n.toggle-button {\n    background-color: lightgrey;\n    border: none;\n    cursor: pointer;\n    outline: none;\n}\n\n.config-holder .student-view-holder {\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex: 1 0 0px;\n    flex: 1 0 0;\n    -ms-flex-direction: column;\n    flex-direction: column;\n}\n\n.config-holder .student-view-holder .mode-config {\n    -ms-flex-align: center;\n    align-items: center;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-pack: justify;\n    justify-content: space-between;\n    margin-bottom: 20px;\n}\n\n.config-holder .student-view-holder .mode-config .modes-holder {\n    -ms-flex-align: center;\n    align-items: center;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex: 1;\n    flex: 1;\n    -ms-flex-pack: distribute;\n    justify-content: space-around;\n}\n\n.custom-checkbox {\n    display: -ms-inline-flexbox;\n    display: inline-flex;\n    -ms-flex-align: center;\n    align-items: center;\n}\n\n.custom-checkbox .circle-container {\n    border: 3px solid rgba(0, 0, 0, 0.54);\n    border-radius: 50%;\n    display: inline-block;\n    margin-right: 5px;\n    height: 12px;\n    padding: 3px;\n    width: 12px;\n}\n\n.custom-checkbox .circle {\n    background: transparent;\n    border-radius: 50%;\n    display: block;\n    height: 100%;\n    width: 100%;\n}\n\n.custom-checkbox .circle-container.full .circle {\n    background: #f50057;\n}\n\n.custom-checkbox .circle-container.full {\n    border-color: #f50057;\n}"; }
}

export { PieDemo };
