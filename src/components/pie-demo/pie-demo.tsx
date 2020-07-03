import { Component, h, Prop, Watch, State, Listen } from "@stencil/core";
import ResizeObserver from "resize-observer-polyfill";
import jsonBeautify from "json-beautify";
import { getPackageWithoutVersion } from "../../util/utils";
import classnames from "classnames";
import docson from "docson";
import { loadCloudPies } from "../../util/PieCloud";
import range from "lodash/range";
import {
  ModelUpdatedEvent,
  InsertImageEvent,
  DeleteImageEvent,
  ImageHandler
} from "@pie-framework/pie-configure-events";
import debug from "debug";

const log = debug("pie-framework:pie-demo");

enum ViewState {
  LOADING,
  READY,
  ERROR
}

interface ScoringObject extends Object {
  score: number;
  details: Object;
}

interface DisplayedScore extends Object {
  score: number;
  json: string;
}

type PieController = {
  model: (config: Object, session: Object, env: Object) => Promise<Object>;
  outcome: (
    config: Object,
    session: Object,
    env: Object
  ) => Promise<ScoringObject>;
};

interface PieElement extends HTMLElement {
  _model: Object;
  model: Object;
  configuration: Object;
  _configuration: Object;
  session: Object;
  onModelChanged: Function;
}

const defaultController = {
  model: (model, session, env) => {
    log(model, session, env);

    return {
      ...model,
      mode: env.mode
    };
  },
  outcome: () => ({
    score: 0,
    details: {}
  })
};

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
  @Prop() model: Object;

  @Prop() configure: Object;

  @State() modelSchemaJSON: Object = null;

  @State() configureSchemaJSON: Object = null;

  @State() configModel: Object;

  @State() configureObject: Object;

  @State() state: ViewState = ViewState.LOADING;

  @State() package: string;

  @State() studentHeaderResizeObserver: any;

  @State() authoringHeaderResizeObserver: any;

  @State() mutationObserver: any;

  @State() rootResizeObserver: any;

  @State() pieName: string;

  @State() pieController: PieController;

  @State() pieElement: PieElement;

  @State() rootEl: any;

  @State() elementParent1: any;

  @State() elementParent2: any;

  @State() minHeightAuthoring: any = "initial";

  @State() minHeightStudent: any = "initial";

  @State() textAreaContentRef1: any;

  @State() textAreaContentRef2: any;

  @State() studentHeader: any;

  @State() authoringHeader: any;

  @State() bottomContentRef: any;

  @State() studentHeaderWidth: number = 500;

  @State() authoringHeaderWidth: number = 500;

  @State() rootElWidth: number = 1250;

  @State() bottomContElWidth: number = 550;

  @State() pieElementModel: Object;

  @State() configElement: PieElement;

  @State() tabIndex: number = 0;

  @State() mobileTabIndex: number = 0;

  @State() currentOption: string = "option1";

  @State() collapsed: string;

  @State() studSettVisible: boolean = false;

  @State() authSettVisible: boolean = false;

  @State() docHolderVisible: boolean = false;

  @State() env: Object = { mode: "gather" };

  @State() session: Object = {};

  @State() scoring: DisplayedScore = {
    score: 0,
    json: ""
  };

  @State() jsonConfigValue: Object = null;

  @State() cachedJsonConfig1: Object = null;

  @State() cachedJsonConfig2: Object = null;

  @State() fileInput: any = null;

  imageHandler: ImageHandler = null;

  handleFileInputChange: (e: Event) => void;
  handleInsertImage: (e: InsertImageEvent) => void;
  handleDeleteImage: (e: DeleteImageEvent) => void;
  handleSetConfigElement: (e: CustomEvent) => void;

  constructor() {
    this.handleFileInputChange = (e: Event) => {
      const input = e.target;

      if (!this.imageHandler) {
        console.error("no image handler - but file input change triggered?");
        return;
      }

      log("[handleInputFiles] input.files: ", input);
      const files = (input as any).files;
      if (files.length < 1 || !files[0]) {
        log("[handleInputFiles] = !!! no files.");
        this.imageHandler.cancel();
        this.imageHandler = null;
      } else {
        const file = files[0];
        this.imageHandler.fileChosen(file);
        this.fileInput.value = "";
        const reader = new FileReader();
        reader.onload = () => {
          log("[reader.onload]");
          const dataURL = reader.result;
          setTimeout(() => {
            this.imageHandler.done(null, dataURL.toString());
            this.imageHandler = null;
          }, 2000);
        };
        log("call readAsDataUrl...", file);
        let progress = 0;
        this.imageHandler.progress(progress, 0, 100);
        range(1, 100).forEach(n => {
          setTimeout(() => {
            this.imageHandler.progress(n, n, 100);
          }, n * 20);
        });
        reader.readAsDataURL(file);
      }
    };

    this.handleInsertImage = (e: InsertImageEvent) => {
      log("[handleInsertImage] fileInput:", this.fileInput);
      this.imageHandler = e.detail;
      this.fileInput.click();
    };

    this.handleDeleteImage = (e: DeleteImageEvent) => {
      e.detail.done();
    };
  }

  componentDidUpdate() {
    if (this.fileInput) {
      this.fileInput.addEventListener("change", this.handleFileInputChange);
    }

    const isAuthoringToggled = this.isToggled("authoring");

    if (isAuthoringToggled) {
      let offset = 0;

      if (this.bottomContentRef) {
        const ref = this.bottomContentRef.querySelector(".tabs");

        if (ref) {
          const clientRect = ref.getBoundingClientRect();

          offset = clientRect.y;

          this.bottomContentRef.style.height = `calc(100vh - ${offset}px)`;
        }
      }
    }
  }

  /**
   * Some functionality
   */
  @Prop() loadPies: Function = elements => {
    loadCloudPies(elements, document);
  };

  collapsePanel(name) {
    this.collapsed = this.collapsed === name ? null : name;
  }

  toggleAuthoringSettings() {
    this.authSettVisible = !this.authSettVisible;
  }

  toggleStudentSettings() {
    this.studSettVisible = !this.studSettVisible;
  }

  isToggled(type = "student") {
    if (type === "student") {
      return this.studSettVisible && this.collapsed !== "student";
    }

    return this.authSettVisible && this.collapsed !== "authoring";
  }

  detachListeners() {
    if (this.configElement) {
      this.configElement.removeEventListener(
        "model.updated",
        this.handleSetConfigElement
      );
    }

    if (this.studentHeader) {
      this.studentHeaderResizeObserver.unobserve(this.studentHeader);
    }

    if (this.authoringHeader) {
      this.authoringHeaderResizeObserver.unobserve(this.authoringHeader);
    }

    this.mutationObserver.disconnect();

    if (this.rootEl) {
      this.rootResizeObserver.unobserve(this.rootEl);
    }
  }

  @Watch("pie")
  watchPie(newPie) {
    log("[watchPie] ", newPie);
    this.package = newPie;
    this.pieName = newPie
      .substr(newPie.lastIndexOf("/") + 1, newPie.length)
      .split("@")[0];

    if (this.pieName.indexOf("-") < 0) {
      this.pieName = `x-${this.pieName}`;
    }

    customElements.whenDefined(this.pieName).then(async () => {
      // TODO - what if same element reloaded, could elems be redefined? may need to undefine prior?
      const packageWithoutVersion = getPackageWithoutVersion(this.package);
      this.pieController =
        window["pie"].default[packageWithoutVersion].controller ||
        defaultController;
      if (this.model) {
        this.updatePieModelFromController(this.model, this.session, this.env);
      }
      this.state = ViewState.READY;
    });

    if (this.load) {
      loadCloudPies({ [this.pieName]: this.package }, document);
    }
  }

  @Watch("model")
  updateModel(newModel) {
    this.configModel = newModel;
  }

  @Watch("configure")
  async updateConfigure(newConfigure) {
    this.configureObject = newConfigure;
  }

  @Watch("configModel")
  watchConfigModel(newModel) {
    if (this.configElement) this.configElement.model = newModel;
    this.updatePieModelFromController(newModel, this.session, this.env);
  }

  @Watch("configureObject")
  async watchConfigureObject(newConfigure) {
    if (this.configElement) this.configElement.configuration = newConfigure;
  }

  async updatePieModelFromController(model, session, env) {
    if (this.pieController && this.pieController.model) {
      this.pieElementModel = await this.pieController.model(
        model,
        session,
        env
      );

      const scoring = await this.pieController.outcome(
        this.configModel,
        this.session,
        this.env
      );

      this.scoring = {
        score: scoring.score,
        json: jsonBeautify(scoring.details, null, 2, 80)
      };

      if (this.pieElement) {
        this.pieElement.model = this.pieElementModel;
      }
    }
  }

  @Watch("pieElement")
  watchPieElement(pieElement) {
    if (pieElement && !pieElement.model) {
      pieElement.model = this.pieElementModel;
    }
  }

  @Watch("pieElementModel")
  watchPieElementModel(newModel) {
    if (this.pieElement) {
      this.pieElement.model = newModel;
      this.pieElement.configuration = this.configureObject;
    }
  }

  @Watch("studentHeader")
  watchStudentHeader(current, previous) {
    if (current) {
      this.studentHeaderResizeObserver.observe(current);
    } else {
      this.studentHeaderResizeObserver.unobserve(previous);
      this.detachListeners();
    }
  }

  @Watch("authoringHeader")
  watchAuthoringHeader(current, previous) {
    if (current) {
      this.authoringHeaderResizeObserver.observe(current);
    } else {
      this.authoringHeaderResizeObserver.unobserve(previous);
      this.detachListeners();
    }
  }

  @Watch("elementParent1")
  watchElementParent1(current) {
    if (current) {
      this.mutationObserver.observe(current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    } else {
      this.mutationObserver.disconnect();
    }
  }

  @Watch("elementParent2")
  watchElementParent2(current) {
    if (current) {
      this.mutationObserver.observe(current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    } else {
      this.mutationObserver.disconnect();
    }
  }

  @Watch("rootEl")
  watchRootEl(current, previous) {
    if (current) {
      this.rootResizeObserver.observe(current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    } else {
      this.rootResizeObserver.unobserve(previous);
    }
  }

  componentWillLoad() {
    log("component will load ... ");
    this.watchPie(this.pie);

    this.studentHeaderResizeObserver = new (ResizeObserver as any)(() => {
      if (this.studentHeader) {
        this.studentHeaderWidth = this.studentHeader.offsetWidth;
      }
    });

    this.authoringHeaderResizeObserver = new (ResizeObserver as any)(() => {
      if (this.authoringHeader) {
        this.authoringHeaderWidth = this.authoringHeader.offsetWidth;
      }
    });

    this.mutationObserver = new MutationObserver(() => {
      this.handleElementParentResize();
    });

    this.rootResizeObserver = new (ResizeObserver as any)(() => {
      if (this.rootEl) {
        this.rootElWidth = this.rootEl.offsetWidth;
      }
    });

    if (this.model) {
      this.updateModel(this.model);
    }

    if (this.configure) {
      this.updateConfigure(this.configure);
    }

    if (this.modelSchemaJSONURI) {
      this.watchModelSchemaJSONURI(this.modelSchemaJSONURI);
    }

    if (this.configureSchemaJSONURI) {
      this.watchConfigureSchemaJSONURI(this.configureSchemaJSONURI);
    }

    docson.templateBaseUrl = "/assets/html";
  }

  handleElementResize(el, name) {
    let minHeight = "initial";

    const navigateNode = el => {
      if (el.nodeType === 1) {
        const allStyle = getComputedStyle(el);

        if (
          !el.matches(".element-holder") &&
          allStyle.position === "absolute"
        ) {
          const bounding = el.getBoundingClientRect();
          const currentHeight = bounding.top + bounding.height;

          if (minHeight === "initial" || currentHeight > minHeight) {
            minHeight = currentHeight;
          }
        }

        if (el.childNodes.length > 0) {
          el.childNodes.forEach(ch => navigateNode(ch));
        }
      }
    };

    navigateNode(el);

    this[name] = minHeight;
  }

  handleElementParentResize() {
    if (this.elementParent1) {
      this.handleElementResize(this.elementParent1, "minHeightAuthoring");
    }

    if (this.elementParent2) {
      this.handleElementResize(this.elementParent2, "minHeightStudent");
    }
  }

  /**
   * Pick up @pie-framework/pie-configure-events and trigger an update.
   * TODO: Why cant i use ModelUpdatedEvent.TYPE in the decorator?
   */
  @Listen("model.updated")
  onModelUpdated(event: ModelUpdatedEvent) {
    log("MODEL UPDATED: target:", event.target, event.detail);
    this.model = event.detail.update;
    this.updatePieModelFromController(
      event.detail.update,
      this.session,
      this.env
    );
  }

  @Watch("configElement")
  watchConfigElement(el: PieElement) {
    if (!el) {
      return;
    }

    el.addEventListener(InsertImageEvent.TYPE, this.handleInsertImage);
    el.addEventListener(DeleteImageEvent.TYPE, this.handleDeleteImage);
  }

  @Watch("modelSchemaJSONURI")
  watchModelSchemaJSONURI(newUrl) {
    if (newUrl) {
      fetch(newUrl, {
        mode: "cors"
      })
        .then((response: Response) => response.json())
        .then(response => {
          this.modelSchemaJSON = response;
        });
    }
  }

  @Watch("configureSchemaJSONURI")
  watchConfigureSchemaJSONURI(newUrl) {
    if (newUrl) {
      fetch(newUrl, {
        mode: "cors"
      })
        .then((response: Response) => response.json())
        .then(response => {
          this.configureSchemaJSON = response;
        });
    }
  }

  setMode(mode) {
    this.env["mode"] = mode;
    this.updatePieModelFromController(this.configModel, this.session, this.env);
  }

  setOption(option) {
    this.currentOption = option;
  }

  customCheckBox({ label, checked, value, action = undefined }) {
    return (
      <label class="custom-checkbox" onClick={() => action.call(this, value)}>
        <i class="material-icons">
          {checked ? "radio_button_checked" : "radio_button_unchecked"}
        </i>
        <span>{label}</span>
      </label>
    );
  }

  renderHeaderTitleInfo({ title, description, options = undefined }) {
    return (
      <div class="header-title">
        <div class="title-info">
          <h4>{title}</h4>
          {options &&
            options.map(opt => (
              <span class="option">
                <i class="fa fa-circle"></i>
                {opt}
              </span>
            ))}
        </div>
        <span>{description}</span>
      </div>
    );
  }

  viewDocumentation = tabIndex => {
    log("Tab Index", tabIndex);

    const currentContent =
      tabIndex === 1 ? this.modelSchemaJSON : this.configureSchemaJSON;

    this.docHolderVisible = true;
    docson.doc("schema-holder", currentContent);
  };

  renderJsonConfigPanel = (jsonData, index) => {
    log(jsonData);

    return (
      <div class="json-config">
        <div class="json-config-header">
          <div
            class="view-container"
            onClick={() => this.viewDocumentation(index)}
          >
            <i class="fa fa-desktop" />
            <span>View Documentation</span>
          </div>
          <div class="right-content">
            <div
              class="copy-container"
              onClick={() => {
                this[`textAreaContentRef${index}`].select();

                document.execCommand("copy");
              }}
            >
              <i class="fa fa-clone" />
              <span>Copy JSON</span>
            </div>
            <div
              class="reset-container"
              onClick={() => {
                if (this[`textAreaContentRef${index}`]) {
                  this[`textAreaContentRef${index}`].value = jsonBeautify(
                    this[`cachedJsonConfig${index}`],
                    null,
                    2,
                    98
                  );
                }
              }}
            >
              <i class="fa fa-undo" />
              <span>Reset</span>
            </div>
          </div>
        </div>
        <textarea
          ref={el => (this[`textAreaContentRef${index}`] = el as any)}
          class="json-content"
          value={jsonBeautify(jsonData, null, 2, 98)}
          onChange={e => {
            const target = e.target as any;

            if (index === 1) {
              this.configModel = JSON.parse(target.value);
            } else {
              this.configureObject = JSON.parse(target.value);
            }
          }}
        ></textarea>
      </div>
    );
  };

  renderAuthoringBottomContent() {
    return this.renderTabs(
      [
        {
          name: "Item Model",
          content: () => {
            this.cachedJsonConfig1 = this.configElement._model;

            return this.renderJsonConfigPanel(this.configElement._model, 1);
          }
        },
        {
          name: "Authoring View Settings",
          content: () => {
            this.cachedJsonConfig2 = this.configElement._configuration;

            return this.renderJsonConfigPanel(
              this.configElement._configuration,
              2
            );
          }
        }
      ],
      200
    );
  }

  renderAuthoringHeader(smallView = false) {
    const isToggled = this.isToggled("authoring");

    return (
      <div
        ref={el => (this.authoringHeader = el as any)}
        class={classnames("authoring-header", {
          collapsed: this.collapsed === "authoring",
          toggled: isToggled
        })}
      >
        <div class="topContent">
          {this.renderHeaderTitleInfo({
            title: isToggled ? "Dev Options" : "Authoring View",
            description: isToggled
              ? "Lorem ipsum dolor sit amet, consectetur adipisicing elit."
              : "The view an author sees when configuring this interaction."
          })}
          {!isToggled && (
            <div class="buttons-container">
              <div
                class={classnames("toggle-container", {
                  toggled: this.isToggled("authoring")
                })}
                onClick={() => this.toggleAuthoringSettings()}
              >
                <i class="material-icons toggle-icon">
                  {this.authSettVisible ? "toggle_on" : "toggle_off"}
                </i>
                <span class="toggle-text">Dev Options</span>
              </div>
              {smallView && (
                <div
                  class="mobile-button"
                  onClick={() => (this.mobileTabIndex = 1)}
                >
                  <span>STUDENT VIEW</span>
                </div>
              )}
            </div>
          )}
          {!isToggled && !smallView && (
            <i
              class={classnames("material-icons", "collapse-icon", {
                collapsed: this.collapsed === "student"
              })}
              onClick={() => this.collapsePanel("student")}
            >
              {this.collapsed === "student"
                ? "format_indent_decrease"
                : "format_indent_increase"}
            </i>
          )}
          {isToggled && (
            <span
              class="close-icon"
              onClick={() => this.toggleAuthoringSettings()}
            >
              X
            </span>
          )}
        </div>
        <div
          ref={el => (this.bottomContentRef = el as any)}
          style={{
            height: '100vh'
          }}
          class="bottomContent authoring"
        >
          {isToggled && this.renderAuthoringBottomContent()}
        </div>
      </div>
    );
  }

  renderRoleConfigContainer() {
    return (
      <div class="roles-settings">
        <h5>Role</h5>
        <div class="roles-options">
          {this.customCheckBox({
            label: "Student",
            checked: this.currentOption === "student",
            value: "student",
            action: this.setOption
          })}
          {this.customCheckBox({
            label: "Instructor",
            checked: this.currentOption === "instructor",
            value: "instructor",
            action: this.setOption
          })}
        </div>
      </div>
    );
  }

  renderModeConfigContainer() {
    return (
      <div class="modes-settings">
        <h5>Mode</h5>
        <div class="modes-options">
          {this.customCheckBox({
            label: "Gather",
            checked: this.env["mode"] === "gather",
            value: "gather",
            action: this.setMode
          })}
          {this.customCheckBox({
            label: "View",
            checked: this.env["mode"] === "view",
            value: "view",
            action: this.setMode
          })}
          {this.customCheckBox({
            label: "Evaluate",
            checked: this.env["mode"] === "evaluate",
            value: "evaluate",
            action: this.setMode
          })}
        </div>
      </div>
    );
  }

  renderSettingsContainer() {
    return (
      <div class="settings-tab-container">
        {this.renderModeConfigContainer()}
        {this.renderRoleConfigContainer()}
      </div>
    );
  }

  renderTabs = (tabs, tabWidth = 100) => {
    const content = tabs[this.tabIndex] ? tabs[this.tabIndex].content : null;
    const contentValue = typeof content === "function" ? content() : content;

    return (
      <div class="tabs-container">
        <div class="tabs">
          {tabs.map((tab, index) => (
            <div
              style={{
                width: `${tabWidth}px`
              }}
              class={classnames("tab", {
                selected: this.tabIndex === index
              })}
              onClick={() => (this.tabIndex = index)}
            >
              {tab.name}
            </div>
          ))}
        </div>
        <span
          class="selected-line"
          style={{
            left: `${this.tabIndex * tabWidth}px`,
            width: `${tabWidth}px`
          }}
        ></span>
        <div class="tab-content">{contentValue}</div>
      </div>
    );
  };

  renderBottomContent() {
    return this.renderTabs([
      {
        name: "Settings",
        content: this.renderSettingsContainer()
      },
      {
        name: "Embed",
        content: null
      }
    ]);
  }

  renderStudentHeader(smallView = false) {
    return (
      <div
        ref={el => (this.studentHeader = el as any)}
        class={classnames("student-view-header", {
          collapsed: this.collapsed === "student",
          toggled: this.isToggled()
        })}
      >
        <div class="topContent">
          {this.renderHeaderTitleInfo({
            title: "Student view",
            description:
              "The view a student (or instructor) sees when entering or reviewing the interaction.",
            options: [this.env["mode"], this.currentOption]
          })}

          <div class="buttons-container">
            <div
              class={classnames("toggle-container", "student", {
                toggled: this.isToggled()
              })}
              onClick={() => this.toggleStudentSettings()}
            >
              <i class="material-icons toggle-icon">
                {this.studSettVisible ? "toggle_on" : "toggle_off"}
              </i>
              <span class="toggle-text">Options</span>
            </div>
          </div>
          {!smallView && (
            <i
              class={classnames("material-icons", "collapse-icon", {
                collapsed: this.collapsed === "authoring"
              })}
              onClick={() => this.collapsePanel("authoring")}
            >
              {this.collapsed === "authoring"
                ? "format_indent_increase"
                : "format_indent_decrease"}
            </i>
          )}
          {smallView && (
            <div
              class="mobile-button"
              onClick={() => (this.mobileTabIndex = 0)}
            >
              <span>AUTHORING VIEW</span>
            </div>
          )}
        </div>
        <div class="bottomContent">{this.renderBottomContent()}</div>
      </div>
    );
  }

  renderCollapsedPanel(title, toggled = undefined) {
    return (
      <div
        class={classnames("collapsed-panel", {
          toggled: toggled
        })}
      >
        <span>{title}</span>
      </div>
    );
  }

  renderAuthoringHolder = (smallView = false) => {
    const ConfigTag = this.pieName + "-config";
    const isCollapsed = this.collapsed === "authoring";

    return (
      <div
        class={classnames("authoring-holder", {
          collapsed: this.collapsed === "authoring",
          toggled: this.isToggled()
        })}
      >
        <div
          class={classnames("control-bar", {
            justElement: this.justElement
          })}
        >
          {this.renderAuthoringHeader(smallView)}
        </div>
        {isCollapsed &&
          this.renderCollapsedPanel("Authoring View", this.isToggled())}
        {!isCollapsed && (
          <div
            ref={el => el && (this.elementParent1 = el as any)}
            class={classnames("element-holder", {
              justElement: this.justElement
            })}
          >
            <div
              class="element-parent"
              style={{
                minHeight: `${this.minHeightAuthoring}px`
              }}
            >
              <ConfigTag
                id="configure"
                ref={el => (this.configElement = el as PieElement)}
                model={this.configModel}
                configure={this.configureObject}
                session={this.session}
              />
            </div>
          </div>
        )}
        <input type="file" hidden ref={r => (this.fileInput = r)} />
      </div>
    );
  };

  renderStudentHolder = (smallView = false) => {
    const TagName = this.pieName + "";
    const isCollapsed = this.collapsed === "student";

    return (
      <div
        class={classnames("student-view-holder", {
          collapsed: this.collapsed === "student",
          toggled: this.isToggled()
        })}
      >
        <div
          class={classnames("control-bar", {
            justElement: this.justElement
          })}
        >
          {this.renderStudentHeader(smallView)}
        </div>
        {isCollapsed && this.renderCollapsedPanel("Student View")}
        {!isCollapsed && (
          <div
            class={classnames("element-holder", {
              toggled: this.studSettVisible,
              justElement: this.justElement
            })}
          >
            <div
              class={classnames("score-holder", {
                visible: this.env["mode"] === "evaluate"
              })}
            >
              <div class="score">
                <span>Score: </span> {this.scoring.score}
              </div>
              <pre>{this.scoring.json}</pre>
            </div>
            <div
              ref={el => el && (this.elementParent2 = el as any)}
              class="element-parent"
              style={{
                minHeight: `${this.minHeightStudent}px`
              }}
            >
              <TagName
                id="render"
                ref={el => el && (this.pieElement = el as PieElement)}
                model={this.pieElementModel}
                session={this.session}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  renderContent = () => {
    if (this.rootElWidth >= 1200) {
      return (
        <div class="config-holder">
          {this.renderAuthoringHolder()}
          <span
            class={classnames("divider", {
              larger: this.studSettVisible && this.authSettVisible
            })}
          />
          {this.renderStudentHolder()}
        </div>
      );
    }

    return (
      <div
        class={classnames("smaller-view", {
          mobile: this.rootElWidth <= 700
        })}
      >
        {this.mobileTabIndex === 0 && this.renderAuthoringHolder(true)}
        {this.mobileTabIndex === 1 && this.renderStudentHolder(true)}
      </div>
    );
  };

  renderDocHolder = () => {
    return (
      <div
        class={classnames("doc-holder", {
          visible: this.docHolderVisible,
          mobile: this.rootElWidth <= 700
        })}
      >
        <span
          class="close-icon"
          onClick={() => (this.docHolderVisible = false)}
        >
          X
        </span>
        <div id="schema-holder" />
      </div>
    );
  };

  render() {
    switch (this.state) {
      case ViewState.LOADING:
        return (
          <div class="root loading">
            <div class="lmask" />
          </div>
        );
      case ViewState.ERROR:
        return <div id="error">Error...</div>;
      case ViewState.READY:
        return (
          <div
            class={classnames("root", {
              multiplePies: this.multiplePies
            })}
            ref={el => el && (this.rootEl = el as any)}
          >
            {this.renderDocHolder()}
            {this.renderContent()}
          </div>
        );
    }
  }
}
