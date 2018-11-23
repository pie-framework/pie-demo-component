/*! Built with http://stenciljs.com */
import { h } from '../pie-demo.core.js';

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
        this.load = true;
        this.editor = true;
        this.preview = true;
        this.playerControls = true;
        this.state = ViewState.LOADING;
        this.toggled = this.preview;
        this.env = { mode: 'gather' };
        this.session = {};
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
    static get style() { return "\@import url(\"https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css\");.control-bar{color:grey;display:-ms-flexbox;display:flex;font-size:16px;font-weight:700;-ms-flex-pack:justify;justify-content:space-between;width:100%}.control-bar .authoring-header{border-bottom:1px solid #db563b;-ms-flex:1;flex:1;margin-right:30px;position:relative}.control-bar .authoring-header.collapsed{max-width:20px}.control-bar .authoring-header.collapsed h4{display:none}.control-bar .authoring-header i{position:absolute;top:0;right:0}.control-bar .student-view-header{border-bottom:1px solid #db563b;-ms-flex:1 0 0px;flex:1 0 0}.authoring-holder{-ms-flex:1 0 0px;flex:1 0 0;margin-right:30px}.root{border:green}.config-holder{display:-ms-flexbox;display:flex;padding-bottom:20px;padding-top:20px;width:100%}.toggle-button{background-color:#d3d3d3;border:none;cursor:pointer;outline:none}.config-holder .student-view-holder{display:-ms-flexbox;display:flex;-ms-flex:1 0 0px;flex:1 0 0;-ms-flex-direction:column;flex-direction:column}.config-holder .student-view-holder .mode-config{-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;-ms-flex-pack:justify;justify-content:space-between;margin-bottom:20px}.config-holder .student-view-holder .mode-config .modes-holder{-ms-flex-align:center;align-items:center;display:-ms-flexbox;display:flex;-ms-flex:1;flex:1;-ms-flex-pack:distribute;justify-content:space-around}.custom-checkbox{display:-ms-inline-flexbox;display:inline-flex;-ms-flex-align:center;align-items:center}.custom-checkbox .circle-container{border:3px solid rgba(0,0,0,.54);border-radius:50%;display:inline-block;margin-right:5px;height:12px;padding:3px;width:12px}.custom-checkbox .circle{background:transparent;border-radius:50%;display:block;height:100%;width:100%}.custom-checkbox .circle-container.full .circle{background:#f50057}.custom-checkbox .circle-container.full{border-color:#f50057}"; }
}

export { PieDemo };
