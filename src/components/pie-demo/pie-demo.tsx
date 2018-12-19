import { Component, Prop, Watch, State } from '@stencil/core';
import { loadCloudPies } from '../../util/PieCloud';
import classnames from 'classnames';

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

  @State() pieName: string;

  @State() pieController: PieController;

  @State() pieElement: PieElement;

  @State() pieElementModel: Object;

  @State() configElement: PieElement;

  @State() collapsed: string;

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
    if (window['pie']) {
      console.log('model property updated');
      this.configModel = newModel;
    }
  }

  @Watch('configModel')
  async watchConfigModel(newModel) {
    if (this.configElement) this.configElement.model = newModel;
    this.updatePieModelFromController(newModel, this.session, this.env);
  }

  async updatePieModelFromController(model, session, env) {
    if (this.pieController) {
      this.pieElementModel =  await this.pieController.model(model, session, env);
      if (this.pieElement) {
        this.pieElement.model = this.pieElementModel;
      }
    } 
  }
  
  @Watch('pieElementModel')
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

  customCheckBox({ label, checked, value }) {
    return (
      <label
        class="custom-checkbox"
        onClick={() => this.setMode(value)}
      >
        <i class="material-icons">
          {checked ? 'radio_button_checked' : 'radio_button_unchecked'}
        </i>
        <span>{label}</span>
      </label>
    );
  }

  renderControlBar = () => {
    return (
      <span class="control-bar">
              <div
                class={
                  classnames(
                    'authoring-header',
                    {
                      'collapsed': this.collapsed === 'authoring'
                    }
                  )
                }
              >
                <i
                  class="material-icons collapse-icon"
                  onClick={() => this.collapsePanel('student')}
                >
                  format_indent_increase
                </i>
                <h4>
                  Authoring View
                </h4>
              </div>
              <div
                class={
                  classnames(
                    'student-view-header',
                    {
                      'collapsed': this.collapsed === 'student'
                    }
                  )
                }
              >
                <div class="center-content">
                  <h4>
                    Student View
                  </h4>
                  <div class="mode-config">
                    <h5>Mode</h5>
                    <div class="modes-holder">
                      {this.customCheckBox({
                        label: 'Gather',
                        checked: this.env[ 'mode' ] === 'gather',
                        value: 'gather'
                      })}
                      {this.customCheckBox({
                        label: 'View',
                        checked: this.env[ 'mode' ] === 'view',
                        value: 'view'
                      })}
                      {this.customCheckBox({
                        label: 'Evaluate',
                        checked: this.env[ 'mode' ] === 'evaluate',
                        value: 'evaluate'
                      })}
                    </div>
                  </div>
                </div>
                <i
                  class="material-icons collapse-icon"
                  onClick={() => this.collapsePanel('authoring')}
                >
                  format_indent_decrease
                </i>
              </div>
            </span>
    );
  };

  renderCollapsedPanel = (title) => {
    return (
      <div class="collapsed-panel">
        <span>
          {title}
        </span>
      </div>
    );
  };

  renderAuthoringHolder = () => {
    const ConfigTag = this.pieName + '-config';

    if (this.collapsed === 'authoring') {
      return this.renderCollapsedPanel('Authoring View');
    }

    return (
      <div
        class={
          classnames(
            'authoring-holder',
            {
              'collapsed': this.collapsed === 'authoring'
            }
          )
        }
      >
        <ConfigTag
          id="configure"
          ref={el => (this.configElement = el as PieElement)}
          model={this.model}
          session={this.session}
        />
      </div>
    );
  };

  renderStudentHolder = () => {
    const TagName = this.pieName + '';

    if (this.collapsed === 'student') {
      return this.renderCollapsedPanel('Student View');
    }

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
        <TagName
          id="render"
          ref={el => el && (this.pieElement = el as PieElement)}
          model={this.pieElementModel}
          session={this.session}
        />
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
            {this.renderControlBar()}
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
