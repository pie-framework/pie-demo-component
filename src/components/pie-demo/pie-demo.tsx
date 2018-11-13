import { Component, Prop, Watch, State } from '@stencil/core';
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

  @State() toggled: boolean = this.preview;

  @State() env: Object = {mode: 'gather'};

  @State() session: Object = {};

  // @Element() private element: HTMLElement

  toggleEditor() {
    this.toggled = !this.toggled;
  }

  @Watch('pie')
  watchPie(newPie) {
    console.log('pie-watch triggered');
    this.package = newPie;
    this.pieName = newPie.substr(newPie.lastIndexOf('/') + 1, newPie.length).split('@')[0];

    customElements.whenDefined(this.pieName).then(async () => {
      // TODO - what if same element reloaded, could elems be redefined? may need to undefine prior?
      const packageWithoutVersion = this.package.replace(/(?<=[a-z])\@(?:.(?!\@))+$/, '');
      this.pieController = window['pie'].default[packageWithoutVersion].controller;
      this.updatePieModelFromController(this.model, this.session, this.env);
      this.state = ViewState.READY;
      
    });

    loadCloudPies({ [this.pieName]: this.package }, document);
  }

  @Watch('model')
  async updateModel(newModel) {
    console.log('model property updated');
    this.configModel = newModel;
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
    this.pieElement.model = newModel;
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

  setMode(event) {
    this.env['mode'] = event.target.value; 
    this.updatePieModelFromController(this.configModel, this.session, this.env);
  }

  render() {
    switch (this.state) {
      case ViewState.LOADING:
        return <div id="loading">Loading...</div>;
      case ViewState.ERROR:
        return <div id="error">Error...</div>;
      case ViewState.READY:
        console.log('rendering');
        const Tagname = this.pieName;
        const ConfigTag = this.pieName + '-config';
        return (
          <div class="root">
            <span class="control-bar">
              <span class="bar"> </span>
              <div>
              <select onInput={(event) => this.setMode(event)}>
                <option value="gather" selected={this.env['mode'] === 'gather'}>Gather</option>
                <option value="view" selected={this.env['mode'] === 'view'}>View</option>
                <option value="evaluate" selected={this.env['mode'] === 'evaluate'}>Evaluate</option>

              </select>
              </div>
              <span>
                <button 
                  class="toggle-button"
                  onClick={ () => this.toggleEditor()}>
                  {this.toggled ? (
                    <span>Hide Editor</span>
                  ) : (
                    <span>Show Editor</span>
                  )}
                </button>
              </span>
            </span>
            <div class="config-holder">
              <Tagname
                id="render"
                ref={el => (this.pieElement = el as PieElement)}
                model={this.pieElementModel}
                session={{}}
              />
              <div 
              class="divider" 
              />
              <ConfigTag
                id="configure"
                ref={el => (this.configElement = el as PieElement)}
                model={this.model}
                style={{ "display": this.toggled ? 'block' : 'none' }}
                session={{}}
              />
            </div>
          </div>
        );
    }
  }
}
