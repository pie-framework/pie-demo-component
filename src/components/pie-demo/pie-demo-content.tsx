import { Component, h, Prop, Watch, State, Listen } from '@stencil/core';
import '@pie-framework/pie-player-components';
import { ItemConfig } from '@pie-framework/pie-player-components/dist/types/interface';
import { JSX } from '@pie-framework/pie-player-components/dist/types/components';
import ResizeObserver from 'resize-observer-polyfill';
import jsonBeautify from 'json-beautify';
import { getPackageWithoutVersion, packageToElementName } from '../../util/utils';
import classnames from 'classnames';
import docson from 'docson';
import range from 'lodash/range';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge'
import throttle from 'lodash/throttle'
import {
  ModelUpdatedEvent,
  InsertImageEvent,
  DeleteImageEvent,
  ImageHandler
} from '@pie-framework/pie-configure-events';
import debug from 'debug';

const log = debug('pie-framework:pie-demo');

enum ViewState {
  LOADING,
  READY,
  ERROR
}

interface ScoringObject extends Object, DisplayedScore {
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
  validate?: (
    model: Object,
    config: Object,
  ) => Promise<Object>;
};

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
  tag: 'pie-demo-content',
  styleUrl: 'pie-demo.css',
  shadow: false // TODO - css doesn't work if you use shadow-dom. Investigate.
})
export class PieDemoContent {
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

  @Prop() configSettings: {
    [key: string]: Object;
  };

  @Prop() config: ItemConfig;

  @State() state: ViewState = ViewState.LOADING;

  @State() package: string;

  @State() rootResizeObserver: any;

  // each key will be a package name, without version
  @State() pieControllers: {
    [key: string]: PieController;
  } = {};

  // each key will be a package name, without version
  @State() configureObject: {
    [key: string]: Object;
  };

  @State() minHeightAuthoring: any = 'initial';

  @State() minHeightStudent: any = 'initial';

  @State() rootElWidth: number = 1250;

  @State() bottomContElWidth: number = 550;

  @State() tabIndex: number = 0;

  @State() mobileTabIndex: number = 0;

  @State() currentOption: string = 'student';

  @State() collapsed: string;

  @State() studSettVisible: boolean = false;

  @State() authSettVisible: boolean = false;

  @State() docHolderVisible: boolean = false;

  @State() env: Object = { mode: 'gather' };

  @State() sessions: Object = {};

  @State() scores: {
    [key: string]: DisplayedScore
  } = {};

  @State() _renderStudent: Boolean = false;

  imageHandler: ImageHandler = null;

  configureSchemaJSON: Object = null;

  modelSchemaJSON: Object = null;

  textAreaContentRef1: any;
  textAreaContentRef2: any;

  // todo replace cached Json config
  cachedJsonConfig1: Object = null;

  rootEl: any = null;
  elementParent1: any;
  elementParent2: any;

  pieAuthor: JSX.PieAuthor;
  piePlayer: JSX.PiePlayer;

  fileInput: any = null;
  bottomContentRef: any;

  _renderingAuthor: Boolean = false;
  _renderingStudent: Boolean = false;

  handleFileInputChange: (e: Event) => void;
  handleInsertImage: (e: InsertImageEvent) => void;
  handleDeleteImage: (e: DeleteImageEvent) => void;

  constructor() {
    this.handleFileInputChange = (e: Event) => {
      const input = e.target;

      if (!this.imageHandler) {
        console.error('no image handler - but file input change triggered?');
        return;
      }

      log('[handleInputFiles] input.files: ', input);
      const files = (input as any).files;
      if (files.length < 1 || !files[0]) {
        log('[handleInputFiles] = !!! no files.');
        this.imageHandler.cancel();
        this.imageHandler = null;
      } else {
        const file = files[0];
        this.imageHandler.fileChosen(file);
        this.fileInput.value = '';
        const reader = new FileReader();
        reader.onload = () => {
          log('[reader.onload]');
          const dataURL = reader.result;
          setTimeout(() => {
            this.imageHandler.done(null, dataURL.toString());
            this.imageHandler = null;
          }, 2000);
        };
        log('call readAsDataUrl...', file);
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

    this.handleRootEl = this.handleRootEl.bind(this);

    this.handleInsertImage = (e: InsertImageEvent) => {
      log('[handleInsertImage] fileInput:', this.fileInput);
      this.imageHandler = e.detail;
      this.fileInput.click();
    };

    this.handleDeleteImage = (e: DeleteImageEvent) => {
      e.detail.done();
    };
  }

  componentDidUpdate() {
    if (this.config && 'elements' in this.config && this.config.elements) {
      const elements = this.config.elements;

      Object.keys(elements).map(element => {
        try {
          const authorElName = `${element}-config`;
          const authorElement = document.querySelector(authorElName);
          const configKey = getPackageWithoutVersion(elements[element]);

          if (authorElement) {
            // @ts-ignore
            this.configureObject[configKey] = authorElement._configuration;
          }
        } catch (e) {
          console.log(e.toString());
        }
      })
    }

    if (this.fileInput) {
      this.fileInput.addEventListener('change', this.handleFileInputChange);
    }

    const isAuthoringToggled = this.isToggled('authoring');

    if (isAuthoringToggled) {
      let offset = 0;

      if (this.bottomContentRef) {
        const ref = this.bottomContentRef.querySelector('.tabs');

        if (ref) {
          const clientRect = ref.getBoundingClientRect();

          offset = clientRect.y;

          this.bottomContentRef.style.height = `calc(100vh - ${offset}px)`;
        }
      }
    }
  }

  collapsePanel(name) {
    this.collapsed = this.collapsed === name ? null : name;
  }

  toggleAuthoringSettings() {
    this.authSettVisible = !this.authSettVisible;
  }


  getProperController = (model) => {
    const divA = document.createElement('div');
    if ('markup' in this.config) {
      divA.innerHTML = this.config.markup;

      if (model.id) {
        const tag = Object.keys(this.config.elements).find(key => key === divA.querySelector(`[id="${model.id}"]`).tagName.toLowerCase())
        const packageWithoutVersion = getPackageWithoutVersion(this.config.elements[tag]);
        const controller = this.pieControllers[packageWithoutVersion];

        return {
          controller,
          tag
        }
      }

      return {};
    }

    return {};
  }

  async validateItem() {
    // Just call the validation method from pie-author, it will do everything that needs to be done
    // @ts-ignore
    await this.pieAuthor.validateModels();
  }

  toggleStudentSettings() {
    this.studSettVisible = !this.studSettVisible;
  }

  isToggled(type = 'student') {
    if (type === 'student') {
      return this.studSettVisible && this.collapsed !== 'student';
    }

    return this.authSettVisible && this.collapsed !== 'authoring';
  }

  detachListeners() {
    if (this.rootEl) {
      this.rootResizeObserver.unobserve(this.rootEl);
    }
  }

  @Watch('config')
  watchConfig(newConfig) {
    Object.values(newConfig.elements || {}).map((packageNAME: string) => {
      let packageCopy = packageNAME;

      customElements.whenDefined(`pp-${packageToElementName(packageNAME)}`).then(async () => {
        // TODO - what if same element reloaded, could elems be redefined? may need to undefine prior?
        const packageWithoutVersion = getPackageWithoutVersion(packageCopy);

        // todo for some reason, the previous components are no longer on window.pie.default, not sure why
        if (window['pie'].default[packageWithoutVersion].controller || defaultController) {
          this.pieControllers[packageWithoutVersion] = window['pie'].default[packageWithoutVersion].controller || defaultController
        }

        // if (this.model) {
        //     this.updatePieModelUsingController(this.model, this.session, this.env);
        // }
        this.state = ViewState.READY;
      });

      if (this.load) {
        this.state = ViewState.READY;
      }

    })
  }

  async updatePieModelUsingController(model, env, shouldResetSession?: boolean) {
    if ('elements' in this.config && 'markup' in this.config) {
      const properController = this.getProperController(model).controller;
      const modelIndex = this.config.models.findIndex(m => m.id === model.id);
      const session = this.sessions[model.id];

      if (properController && properController.model) {
        const newConfig = await properController.model(
          model,
          session,
          env
        );

        if (this.env['mode'] === 'evaluate') {
          const scoring = await properController.outcome(
            this.config.models.find(m => m.id === model.id),
            session,
            this.env
          );
          this.scores[model.id] = {
            score: scoring.score,
            json: jsonBeautify(scoring.details, null, 2, 80)
          };
        }

        if (this.piePlayer) {
          //@ts-ignore
          const newModel = merge(cloneDeep(this.config.models.find(m => m.id === model.id), newConfig));
          const config = cloneDeep(this.config);

          config.models[modelIndex] = newModel;

          if (shouldResetSession && this.piePlayer.session) {
            // only reset that model's session
            this.piePlayer.session.data[this.piePlayer.session.data.findIndex(s => s.id === model.id)] = {};
          }

          this.piePlayer.config = config;
        }
      }
    }
  }

  handleRootEl(current) {
    if (current) {
      this.rootEl = current;
      this.rootResizeObserver.observe(current, {
        attributes: true,
        childList: true,
        subtree: true
      });
    } else if (this.rootEl) {
      this.rootResizeObserver.unobserve(this.rootEl);
    }
  }

  componentWillLoad() {
    log('component will load ... ');
    this.watchConfig(this.config);

    const rootHandler = throttle(() => {
      if (this.rootEl) {
        this.rootElWidth = this.rootEl.offsetWidth;
      }
    }, 1000, { leading: true });

    this.rootResizeObserver = new (ResizeObserver as any)(rootHandler);

    if (this.configSettings) {
      this.configureObject = cloneDeep(this.configSettings);
    }

    if (this.modelSchemaJSONURI) {
      this.watchModelSchemaJSONURI(this.modelSchemaJSONURI);
    }

    if (this.configureSchemaJSONURI) {
      this.watchConfigureSchemaJSONURI(this.configureSchemaJSONURI);
    }

    (window as any).global = window;
    docson.templateBaseUrl = '/assets/html';
  }

  /**
   * Pick up @pie-framework/pie-configure-events and trigger an update.
   * TODO: Why cant i use ModelUpdatedEvent.TYPE in the decorator?
   */
  @Listen('model.updated')
  onModelUpdated(event: ModelUpdatedEvent) {
    if (this._renderingAuthor || this._renderingStudent) {
      this._renderingAuthor = false;
      this._renderingStudent = false;
      return;
    }

    if (!isEqual(this.pieAuthor.config, this.config)) {
      this.config = this.pieAuthor.config;
    }

    log('MODEL UPDATED: target:', event.target, event.detail);
    this.updatePieModelUsingController(
      event.detail.update,
      this.env,
      true
    );
  }

  @Listen('modelLoaded')
  onModelLoaded() {
    if (!this._renderStudent) {
      this._renderStudent = true;
    }
  }

  @Listen('session-changed')
  onSessionChanged(event: ModelUpdatedEvent) {
    log('MODEL UPDATED: target:', event.target, event.detail);
    if (event.target) {
      this.sessions[(event.target as any).session.id] = (event.target as any).session;
    }
  }

  @Watch('modelSchemaJSONURI')
  watchModelSchemaJSONURI(newUrl) {
    if (newUrl) {
      fetch(newUrl, {
        mode: 'cors'
      })
        .then((response: Response) => response.json())
        .then(response => {
          this.modelSchemaJSON = response;
        });
    }
  }

  @Watch('configureSchemaJSONURI')
  watchConfigureSchemaJSONURI(newUrl) {
    if (newUrl) {
      fetch(newUrl, {
        mode: 'cors'
      })
        .then((response: Response) => response.json())
        .then(response => {
          this.configureSchemaJSON = response;
        });
    }
  }

  setMode(mode) {
    this.env = {
      ...this.env,
      mode: mode
    };

    if (this.piePlayer) {
      this.piePlayer.env = { mode: mode, role: this.currentOption };
    }

    if ('models' in this.config) {
      this.config.models.forEach(model => {
        this.updatePieModelUsingController(model, this.env);
      });
    }
  }

  setOption(option) {
    this.currentOption = option;

    if (this.piePlayer) {
      this.piePlayer.env = { mode: this.env['mode'], role: this.currentOption };
    }
  }

  customCheckBox({ label, checked, value, action = undefined }) {
    return (
      <label class="custom-checkbox" onClick={() => action.call(this, value)}>
        <i class="material-icons">
          {checked ? 'radio_button_checked' : 'radio_button_unchecked'}
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
    log('Tab Index', tabIndex);

    const currentContent =
      tabIndex === 1 ? this.modelSchemaJSON : this.configureSchemaJSON;

    this.docHolderVisible = true;
    docson.doc('schema-holder', currentContent);
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
            <i class="fa fa-desktop"/>
            <span>View Documentation</span>
          </div>
          <div class="right-content">
            <div
              class="copy-container"
              onClick={() => {
                this[`textAreaContentRef${index}`].select();

                document.execCommand('copy');
              }}
            >
              <i class="fa fa-clone"/>
              <span>Copy JSON</span>
            </div>
            <div
              class="reset-container"
              onClick={() => {
                if (this[`textAreaContentRef${index}`]) {
                  if (index === 1) {
                    this[`textAreaContentRef${index}`].value = jsonBeautify(
                      this[`cachedJsonConfig${index}`],
                      null,
                      2,
                      98
                    );

                    this.config = this[`cachedJsonConfig${index}`];
                  } else {
                    this[`textAreaContentRef${index}`].value = jsonBeautify(
                      this.configSettings,
                      null,
                      2,
                      98
                    );

                    this.configureObject = this.configSettings;
                  }
                }
              }}
            >
              <i class="fa fa-undo"/>
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
              this.config = JSON.parse(target.value);
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
          name: 'Item Config',
          content: () => {
            this.cachedJsonConfig1 = cloneDeep(this.config);

            return this.renderJsonConfigPanel(this.cachedJsonConfig1, 1);
          }
        },
        {
          name: 'Authoring View Settings',
          content: () => {
            return this.renderJsonConfigPanel(this.configureObject, 2);
          }
        }
      ],
      200
    );
  }

  renderAuthoringHeader(smallView = false) {
    const isToggled = this.isToggled('authoring');

    return (
      <div
        class={classnames('authoring-header', {
          collapsed: this.collapsed === 'authoring',
          toggled: isToggled
        })}
      >
        <div class="topContent">
          {this.renderHeaderTitleInfo({
            title: isToggled ? 'Dev Options' : 'Authoring View',
            description: isToggled
              ? 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'
              : 'The view an author sees when configuring this interaction.'
          })}
          {!isToggled && (
            <div class="buttons-container">
              <div class="toggle-container"
                   onClick={() => this.validateItem()}>
                <span class="toggle-text">Validate</span>
              </div>
              <div
                class={classnames('toggle-container', {
                  toggled: this.isToggled('authoring')
                })}
                onClick={() => this.toggleAuthoringSettings()}
              >
                <i class="material-icons toggle-icon">
                  {this.authSettVisible ? 'toggle_on' : 'toggle_off'}
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
              class={classnames('material-icons', 'collapse-icon', {
                collapsed: this.collapsed === 'student'
              })}
              onClick={() => this.collapsePanel('student')}
            >
              {this.collapsed === 'student'
                ? 'format_indent_decrease'
                : 'format_indent_increase'}
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
            label: 'Student',
            checked: this.currentOption === 'student',
            value: 'student',
            action: this.setOption
          })}
          {this.customCheckBox({
            label: 'Instructor',
            checked: this.currentOption === 'instructor',
            value: 'instructor',
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
            label: 'Gather',
            checked: this.env['mode'] === 'gather',
            value: 'gather',
            action: this.setMode
          })}
          {this.customCheckBox({
            label: 'View',
            checked: this.env['mode'] === 'view',
            value: 'view',
            action: this.setMode
          })}
          {this.customCheckBox({
            label: 'Evaluate',
            checked: this.env['mode'] === 'evaluate',
            value: 'evaluate',
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
    const contentValue = typeof content === 'function' ? content() : content;

    return (
      <div class="tabs-container">
        <div class="tabs">
          {tabs.map((tab, index) => (
            <div
              style={{
                width: `${tabWidth}px`
              }}
              class={classnames('tab', {
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
        name: 'Settings',
        content: this.renderSettingsContainer()
      },
      {
        name: 'Embed',
        content: null
      }
    ]);
  }

  renderStudentHeader(smallView = false) {
    return (
      <div
        class={classnames('student-view-header', {
          collapsed: this.collapsed === 'student',
          toggled: this.isToggled()
        })}
      >
        <div class="topContent">
          {this.renderHeaderTitleInfo({
            title: 'Student view',
            description:
              'The view a student (or instructor) sees when entering or reviewing the interaction.',
            options: [this.env['mode'], this.currentOption]
          })}

          <div class="buttons-container">
            <div
              class={classnames('toggle-container', 'student', {
                toggled: this.isToggled()
              })}
              onClick={() => this.toggleStudentSettings()}
            >
              <i class="material-icons toggle-icon">
                {this.studSettVisible ? 'toggle_on' : 'toggle_off'}
              </i>
              <span class="toggle-text">Options</span>
            </div>
          </div>
          {!smallView && (
            <i
              class={classnames('material-icons', 'collapse-icon', {
                collapsed: this.collapsed === 'authoring'
              })}
              onClick={() => this.collapsePanel('authoring')}
            >
              {this.collapsed === 'authoring'
                ? 'format_indent_increase'
                : 'format_indent_decrease'}
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
        class={classnames('collapsed-panel', {
          toggled: toggled
        })}
      >
        <span>{title}</span>
      </div>
    );
  }

  renderAuthoringHolder = (smallView = false) => {
    const isCollapsed = this.collapsed === 'authoring';
    this._renderingAuthor = true;

    return (
      <div
        class={classnames('authoring-holder', {
          collapsed: this.collapsed === 'authoring',
          toggled: this.isToggled()
        })}
      >
        <div
          class={classnames('control-bar', {
            justElement: this.justElement
          })}
        >
          {this.renderAuthoringHeader(smallView)}
        </div>
        {isCollapsed &&
          this.renderCollapsedPanel('Authoring View', this.isToggled())}
        {!isCollapsed && (
          <div
            ref={el => el && (this.elementParent1 = el as any)}
            class={classnames('element-holder', {
              justElement: this.justElement
            })}
          >
            <div
              class="element-parent"
              style={{
                minHeight: `${this.minHeightAuthoring}px`
              }}
            >
              <pie-author
                class="pie-author"
                ref={el => el && (this.pieAuthor = el as JSX.PieAuthor)}
                config={this.config}
                configSettings={this.configureObject}
                canWatchConfigSettings={true}
                reFetchBundle={true}
              >
                {' '}
              </pie-author>
            </div>
          </div>
        )}
        <input type="file" hidden ref={r => (this.fileInput = r)}/>
      </div>
    );
  };

  renderStudentHolder = (smallView = false) => {
    const isCollapsed = this.collapsed === 'student';
    this._renderingStudent = true;

    if (!this._renderStudent) {
      return null;
    }

    return (
      <div
        class={classnames('student-view-holder', {
          collapsed: this.collapsed === 'student',
          toggled: this.isToggled()
        })}
      >
        <div
          class={classnames('control-bar', {
            justElement: this.justElement
          })}
        >
          {this.renderStudentHeader(smallView)}
        </div>
        {isCollapsed && this.renderCollapsedPanel('Student View')}
        {!isCollapsed && (
          <div
            class={classnames('element-holder', {
              toggled: this.studSettVisible,
              justElement: this.justElement
            })}
          >
            <div class={classnames('score-holder', { visible: this.env['mode'] === 'evaluate' })}>
              <span>Scores:</span>

              {Object.keys(this.scores).map((scoreKey, index) => (
                <div class="score">
                  <span>Item {index + 1}: </span> {this.scores[scoreKey].score}
                  {this.scores[scoreKey].json && <pre>{this.scores[scoreKey].json}</pre>}
                </div>
              ))}
            </div>

            <div
              ref={el => el && (this.elementParent2 = el as any)}
              class="element-parent"
              style={{
                minHeight: `${this.minHeightStudent}px`
              }}
            >
              <pie-player
                class="pie-player"
                ref={el => el && (this.piePlayer = el as JSX.PiePlayer)}
                config={this.config}
                reFetchBundle={true}
              >
                {' '}
              </pie-player>
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
            class={classnames('divider', {
              larger: this.studSettVisible && this.authSettVisible
            })}
          />
          {this.renderStudentHolder()}
        </div>
      );
    }

    return (
      <div
        class={classnames('smaller-view', {
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
        class={classnames('doc-holder', {
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
        <div id="schema-holder"/>
      </div>
    );
  };

  render() {
    switch (this.state) {
      case ViewState.LOADING:
        return (
          <div class="root loading">
            <div class="lmask"/>
          </div>
        );
      case ViewState.ERROR:
        return <div id="error">Error...</div>;
      case ViewState.READY:
        return (
          <div
            class={classnames('root', {
              multiplePies: this.multiplePies
            })}
            ref={this.handleRootEl}
          >
            {this.renderDocHolder()}
            {this.renderContent()}
          </div>
        );
    }
  }
}
