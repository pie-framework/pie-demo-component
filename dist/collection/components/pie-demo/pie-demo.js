import ResizeObserver from 'resize-observer-polyfill';
import classnames from 'classnames';
import { loadCloudPies } from '../../util/PieCloud';
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
        this.studentHeaderWidth = 500;
        this.tabIndex = 0;
        this.currentOption = 'option1';
        this.studSettVisible = false;
        this.env = { mode: 'gather' };
        this.session = {};
        // @Element() private element: HTMLElement
        /**
         * Some functionality
         */
        this.loadPies = (elements) => {
            loadCloudPies(elements, document);
        };
        this.renderAuthoringHolder = () => {
            const ConfigTag = this.pieName + '-config';
            const isCollapsed = this.collapsed === 'authoring';
            return (h("div", { class: classnames('authoring-holder', {
                    collapsed: this.collapsed === 'authoring',
                    toggled: this.isToggled()
                }) },
                h("div", { class: "control-bar" }, this.renderAuthoringHeader()),
                isCollapsed && this.renderCollapsedPanel('Authoring View', this.isToggled()),
                !isCollapsed &&
                    h("div", { class: "element-holder" },
                        h("div", { class: "element-parent" },
                            h(ConfigTag, { id: "configure", ref: el => (this.configElement = el), model: this.model, session: this.session })))));
        };
        this.renderStudentHolder = () => {
            const TagName = this.pieName + '';
            const isCollapsed = this.collapsed === 'student';
            return (h("div", { class: classnames('student-view-holder', {
                    'collapsed': this.collapsed === 'student'
                }) },
                h("div", { class: "control-bar" }, this.renderStudentHeader()),
                isCollapsed && this.renderCollapsedPanel('Student View'),
                !isCollapsed &&
                    h("div", { class: classnames('element-holder', {
                            toggled: this.studSettVisible
                        }) },
                        h("div", { class: "element-parent" },
                            h(TagName, { id: "render", ref: el => el && (this.pieElement = el), model: this.pieElementModel, session: this.session })))));
        };
    }
    collapsePanel(name) {
        this.collapsed = this.collapsed === name ? null : name;
    }
    toggleStudentSettings() {
        this.studSettVisible = !this.studSettVisible;
    }
    isToggled() {
        return this.studSettVisible && this.collapsed !== 'student';
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
        this.configModel = newModel;
    }
    async watchConfigModel(newModel) {
        if (this.configElement)
            this.configElement.model = newModel;
        this.updatePieModelFromController(newModel, this.session, this.env);
    }
    async updatePieModelFromController(model, session, env) {
        if (this.pieController && this.pieController.model) {
            this.pieElementModel = await this.pieController.model(model, session, env);
            if (this.pieElement) {
                this.pieElement.model = this.pieElementModel;
            }
        }
    }
    watchPieElement(pieElement) {
        if (pieElement && !pieElement.model) {
            pieElement.model = this.model;
        }
    }
    watchPieElementModel(newModel) {
        if (this.pieElement) {
            this.pieElement.model = newModel;
        }
    }
    watchResizerObserver(current, previous) {
        if (current) {
            this.resizeObserver.observe(current);
        }
        else {
            this.resizeObserver.unobserve(previous);
        }
    }
    componentWillLoad() {
        console.log('component will load ... ');
        this.watchPie(this.pie);
        this.resizeObserver = new ResizeObserver(() => {
            this.studentHeaderWidth = this.studentHeader.offsetWidth;
        });
        if (this.model) {
            this.updateModel(this.model);
        }
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
    setOption(option) {
        this.currentOption = option;
    }
    customCheckBox({ label, checked, value, action = undefined }) {
        return (h("label", { class: "custom-checkbox", onClick: () => action.call(this, value) },
            h("i", { class: "material-icons" }, checked ? 'radio_button_checked' : 'radio_button_unchecked'),
            h("span", null, label)));
    }
    renderHeaderTitleInfo({ title, description, options = undefined }) {
        return (h("div", { class: "header-title" },
            h("div", { class: "title-info" },
                h("h4", null, title),
                options &&
                    options.map((opt) => (h("span", { class: "option" },
                        h("i", { class: "fa fa-circle" }),
                        opt)))),
            h("span", null, description)));
    }
    renderAuthoringHeader() {
        return (h("div", { class: classnames('authoring-header', {
                collapsed: this.collapsed === 'authoring'
            }) },
            this.renderHeaderTitleInfo({
                title: 'Authoring View',
                description: 'The view an author sees when configuring this interaction.'
            }),
            h("i", { class: "material-icons collapse-icon", onClick: () => this.collapsePanel('student') }, this.collapsed === 'student' ? 'format_indent_decrease' : 'format_indent_increase')));
    }
    ;
    renderRoleConfigContainer() {
        return (h("div", { class: "roles-settings" },
            h("h5", null, "Role"),
            h("div", { class: "roles-options" },
                this.customCheckBox({
                    label: 'Student',
                    checked: this.currentOption === 'student',
                    value: 'student',
                    action: this.setOption
                }),
                this.customCheckBox({
                    label: 'Instructor',
                    checked: this.currentOption === 'instructor',
                    value: 'instructor',
                    action: this.setOption
                }))));
    }
    ;
    renderModeConfigContainer() {
        return (h("div", { class: "modes-settings" },
            h("h5", null, "Mode"),
            h("div", { class: "modes-options" },
                this.customCheckBox({
                    label: 'Gather',
                    checked: this.env['mode'] === 'gather',
                    value: 'gather',
                    action: this.setMode
                }),
                this.customCheckBox({
                    label: 'View',
                    checked: this.env['mode'] === 'view',
                    value: 'view',
                    action: this.setMode
                }),
                this.customCheckBox({
                    label: 'Evaluate',
                    checked: this.env['mode'] === 'evaluate',
                    value: 'evaluate',
                    action: this.setMode
                }))));
    }
    ;
    renderSettingsContainer() {
        return (h("div", { class: "settings-tab-container" },
            this.renderModeConfigContainer(),
            this.renderRoleConfigContainer()));
    }
    ;
    renderBottomContent() {
        return (h("div", { class: "tabs-container" },
            h("div", { class: "tabs" },
                h("div", { class: classnames('tab', {
                        selected: this.tabIndex === 0
                    }), onClick: () => this.tabIndex = 0 }, "Settings"),
                h("div", { class: classnames('tab', {
                        selected: this.tabIndex === 1
                    }), onClick: () => this.tabIndex = 1 }, "Embed")),
            h("span", { class: "selected-line", style: {
                    left: `${this.tabIndex * 100}px`
                } }),
            h("div", { class: "tab-content" }, this.tabIndex === 0 && this.renderSettingsContainer())));
    }
    renderStudentHeader() {
        return (h("div", { ref: el => (this.studentHeader = el), class: classnames('student-view-header', {
                collapsed: this.collapsed === 'student',
                toggled: this.isToggled()
            }) },
            h("div", { class: "topContent" },
                this.renderHeaderTitleInfo({
                    title: 'Student view',
                    description: 'The view a student (or instructor) sees when entering or reviewing the interaction.',
                    options: [
                        this.env['mode'],
                        this.currentOption
                    ]
                }),
                this.studentHeaderWidth >= 800 &&
                    h("span", null, "Toggle Settings"),
                h("i", { class: classnames('material-icons', 'toggle-icon', {
                        toggled: this.isToggled()
                    }), onClick: () => this.toggleStudentSettings() }, this.studSettVisible ? 'toggle_on' : 'toggle_off'),
                h("i", { class: "material-icons collapse-icon", onClick: () => this.collapsePanel('authoring') }, this.collapsed === 'authoring' ? 'format_indent_increase' : 'format_indent_decrease')),
            h("div", { class: "bottomContent" }, this.renderBottomContent())));
    }
    renderControlBar() {
        return (h("div", { class: "control-bar" },
            this.renderAuthoringHeader(),
            this.renderStudentHeader()));
    }
    ;
    renderCollapsedPanel(title, toggled = undefined) {
        return (h("div", { class: classnames('collapsed-panel', {
                toggled: toggled
            }) },
            h("span", null, title)));
    }
    ;
    render() {
        switch (this.state) {
            case ViewState.LOADING:
                return h("div", { id: "loading" }, "Loading...");
            case ViewState.ERROR:
                return h("div", { id: "error" }, "Error...");
            case ViewState.READY:
                console.log('rendering');
                return (h("div", { class: "root" },
                    h("div", { class: "config-holder" },
                        this.renderAuthoringHolder(),
                        h("span", { class: "divider" }),
                        this.renderStudentHolder())));
        }
    }
    static get is() { return "pie-demo"; }
    static get properties() { return {
        "collapsed": {
            "state": true
        },
        "configElement": {
            "state": true,
            "watchCallbacks": ["wachConfigElement"]
        },
        "configModel": {
            "state": true,
            "watchCallbacks": ["watchConfigModel"]
        },
        "currentOption": {
            "state": true
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
            "state": true,
            "watchCallbacks": ["watchPieElement"]
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
        "resizeObserver": {
            "state": true
        },
        "session": {
            "state": true
        },
        "state": {
            "state": true
        },
        "studentHeader": {
            "state": true,
            "watchCallbacks": ["watchResizerObserver"]
        },
        "studentHeaderWidth": {
            "state": true
        },
        "studSettVisible": {
            "state": true
        },
        "tabIndex": {
            "state": true
        }
    }; }
    static get style() { return "/**style-placeholder:pie-demo:**/"; }
}
