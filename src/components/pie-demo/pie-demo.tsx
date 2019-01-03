import { Component, Prop, Watch, State } from '@stencil/core';
import ResizeObserver from 'resize-observer-polyfill'
import classnames from 'classnames';
import { loadCloudPies } from '../../util/PieCloud';

enum ViewState {
  LOADING,
  READY,
  ERROR
}

type PieController = {
  model: (config: Object, session: Object, env: Object) => Promise<Object>;
  score: (config: Object, session: Object, env: Object) => Promise<Object>;
};

interface PieElement extends HTMLElement {
  model: Object;
  session: Object;
}

@Component({
  tag: 'pie-demo',
  styleUrl: 'pie-demo.css',
  shadow: false // TODO - css doesn't work if you use shadow-dom. Investigate.
})
export class PieDemo {
  /**
   * The PIE npm package to demo. e.g. `@pie-element/multiple-choice`
   */
  @Prop() pie: string;
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

  @State() configModel: Object;

  @State() state: ViewState = ViewState.LOADING;

  @State() package: string;

  @State() resizeObserver: any;

  @State() pieName: string;

  @State() pieController: PieController;

  @State() pieElement: PieElement;

  @State() studentHeader: any;

  @State() studentHeaderWidth: number = 500;

  @State() pieElementModel: Object;

  @State() configElement: PieElement;

  @State() tabIndex: number = 0;

  @State() currentOption: string = 'option1';

  @State() collapsed: string;

  @State() studSettVisible: boolean = false;

  @State() env: Object = { mode: 'gather' };

  @State() session: Object = {};

  // @Element() private element: HTMLElement

  /**
   * Some functionality
   */
  @Prop() loadPies: Function = (elements) => {
    loadCloudPies(elements, document);
  };

  collapsePanel(name) {
    this.collapsed = this.collapsed === name ? null : name;
  }

  toggleStudentSettings() {
    this.studSettVisible = !this.studSettVisible;
  }

  isToggled() {
    return this.studSettVisible && this.collapsed !== 'student';
  }

  @Watch('pie')
  watchPie(newPie) {
    console.log('pie-watch triggered');
    this.package = newPie;
    this.pieName = newPie.substr(newPie.lastIndexOf('/') + 1, newPie.length).split('@')[0];

    if (this.pieName.indexOf('-') < 0) {
      this.pieName = `x-${this.pieName}`
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

  @Watch('model')
  async updateModel(newModel) {
    this.configModel = newModel;
  }

  @Watch('configModel')
  async watchConfigModel(newModel) {
    if (this.configElement) this.configElement.model = newModel;
    this.updatePieModelFromController(newModel, this.session, this.env);
  }

  async updatePieModelFromController(model, session, env) {
    if (this.pieController && this.pieController.model) {
      this.pieElementModel =  await this.pieController.model(model, session, env);
      if (this.pieElement) {
        this.pieElement.model = this.pieElementModel;
      }
    } 
  }

  @Watch('pieElement')
  watchPieElement(pieElement) {
    if (pieElement && !pieElement.model) {
      pieElement.model = this.model;
    }
  }
  
  @Watch('pieElementModel')
  watchPieElementModel(newModel) {
    if (this.pieElement) {
      this.pieElement.model = newModel;
    }
  }

  @Watch('studentHeader')
  watchResizerObserver(current, previous) {
    if (current) {
      this.resizeObserver.observe(current);
    } else {
      this.resizeObserver.unobserve(previous);
    }
  }

  componentWillLoad() {
    console.log('component will load ... ');
    this.watchPie(this.pie);

    this.resizeObserver = new (ResizeObserver as any)(() => {
      this.studentHeaderWidth = this.studentHeader.offsetWidth;
    });

    if (this.model) {
      this.updateModel(this.model);
    }
  }

  @Watch('configElement')
  wachConfigElement(newEl: PieElement) {
    newEl && newEl.addEventListener('model.updated', (event: CustomEvent) => {
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
    return (
      <label
        class="custom-checkbox"
        onClick={() => action.call(this, value)}
      >
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
          <h4>
            {title}
          </h4>
          {
            options &&
            options.map((opt) => (
              <span class="option">
                <i class="fa fa-circle">
                </i>
                {opt}
              </span>
            ))
          }
        </div>
        <span>
          {description}
        </span>
      </div>
    )
  }

  renderAuthoringHeader() {
    return (
      <div
        class={
          classnames(
            'authoring-header',
            {
              collapsed: this.collapsed === 'authoring'
            }
          )
        }
      >
        {this.renderHeaderTitleInfo({
          title: 'Authoring View',
          description: 'The view an author sees when configuring this interaction.'
        })}
        <i
          class="material-icons collapse-icon"
          onClick={() => this.collapsePanel('student')}
        >
          {this.collapsed === 'student'  ? 'format_indent_decrease' : 'format_indent_increase'}
        </i>
      </div>
    )
  };

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
  };

  renderModeConfigContainer() {
    return (
      <div class="modes-settings">
        <h5>Mode</h5>
        <div class="modes-options">
          {this.customCheckBox({
            label: 'Gather',
            checked: this.env[ 'mode' ] === 'gather',
            value: 'gather',
            action: this.setMode
          })}
          {this.customCheckBox({
            label: 'View',
            checked: this.env[ 'mode' ] === 'view',
            value: 'view',
            action: this.setMode
          })}
          {this.customCheckBox({
            label: 'Evaluate',
            checked: this.env[ 'mode' ] === 'evaluate',
            value: 'evaluate',
            action: this.setMode
          })}
        </div>
      </div>
    );
  };

  renderSettingsContainer() {
    return (
      <div class="settings-tab-container">
        {this.renderModeConfigContainer()}
        {this.renderRoleConfigContainer()}
      </div>
    );
  };

  renderBottomContent() {
    return (
      <div class="tabs-container">
        <div class="tabs">
          <div
            class={classnames('tab', {
              selected: this.tabIndex === 0
            })}
            onClick={() => this.tabIndex = 0}
          >
            Settings
          </div>
          <div
            class={classnames('tab', {
              selected: this.tabIndex === 1
            })}
            onClick={() => this.tabIndex = 1}
          >
            Embed
          </div>
        </div>
        <span class="selected-line" style={{
          left: `${this.tabIndex * 100}px`
        }}>
        </span>
        <div class="tab-content">
          {this.tabIndex === 0 && this.renderSettingsContainer()}
        </div>
      </div>
    )
  }

  renderStudentHeader() {
    return (
      <div
        ref={el => (this.studentHeader = el as any)}
        class={
          classnames(
            'student-view-header',
            {
              collapsed: this.collapsed === 'student',
              toggled: this.isToggled()
            }
          )
        }
      >
        <div class="topContent">
          {this.renderHeaderTitleInfo({
            title: 'Student view',
            description: 'The view a student (or instructor) sees when entering or reviewing the interaction.',
            options: [
              this.env['mode'],
              this.currentOption
            ]
          })}
          {
            this.studentHeaderWidth >= 800 &&
            <span>
              Toggle Settings
            </span>
          }
          <i
            class={classnames('material-icons', 'toggle-icon', {
              toggled: this.isToggled()
            })}
            onClick={() => this.toggleStudentSettings()}
          >
            {this.studSettVisible ? 'toggle_on' : 'toggle_off'}
          </i>
          <i
            class="material-icons collapse-icon"
            onClick={() => this.collapsePanel('authoring')}
          >
            {this.collapsed === 'authoring' ? 'format_indent_increase' : 'format_indent_decrease'}
          </i>
        </div>
        <div class="bottomContent">
          {this.renderBottomContent()}
        </div>
      </div>
    )
  }

  renderControlBar() {
    return (
      <div class="control-bar">
        {this.renderAuthoringHeader()}
        {this.renderStudentHeader()}
      </div>
    );
  };

  renderCollapsedPanel(title, toggled = undefined) {
    return (
      <div class={classnames('collapsed-panel', {
        toggled: toggled
      })}>
        <span>
          {title}
        </span>
      </div>
    );
  };

  renderAuthoringHolder = () => {
    const ConfigTag = this.pieName + '-config';
    const isCollapsed = this.collapsed === 'authoring';

    return (
      <div
        class={
          classnames(
            'authoring-holder',
            {
              collapsed: this.collapsed === 'authoring',
              toggled: this.isToggled()
            }
          )
        }
      >
        <div class="control-bar">
          {this.renderAuthoringHeader()}
        </div>
        {isCollapsed && this.renderCollapsedPanel('Authoring View', this.isToggled())}
        {
          !isCollapsed &&
          <div class="element-holder">
            <div class="element-parent">
              <ConfigTag
                id="configure"
                ref={el => (this.configElement = el as PieElement)}
                model={this.model}
                session={this.session}
              />
            </div>
          </div>
        }
      </div>
    );
  };

  renderStudentHolder = () => {
    const TagName = this.pieName + '';
    const isCollapsed = this.collapsed === 'student';

    return (
      <div
        class={
          classnames(
            'student-view-holder',
            {
              'collapsed': this.collapsed === 'student'
            }
          )
        }
      >
        <div class="control-bar">
          {this.renderStudentHeader()}
        </div>
        {
          isCollapsed && this.renderCollapsedPanel('Student View')
        }
        {
          !isCollapsed &&
          <div class={classnames('element-holder', {
            toggled: this.studSettVisible
          })}>
            <div class="element-parent">
              <TagName
                id="render"
                ref={el => el && (this.pieElement = el as PieElement)}
                model={this.pieElementModel}
                session={this.session}
              />
            </div>
          </div>
        }
      </div>
    );
  };

  render() {
    switch (this.state) {
      case ViewState.LOADING:
        return <div id="loading">Loading...</div>;
      case ViewState.ERROR:
        return <div id="error">Error...</div>;
      case ViewState.READY:
        console.log('rendering');
        return (
          <div class="root">
            <div class="config-holder">
              {this.renderAuthoringHolder()}
              <span class="divider"/>
              {this.renderStudentHolder()}
            </div>
          </div>
        );
    }
  }
}
