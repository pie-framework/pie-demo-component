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
  @Prop({ mutable: true }) model: Object;

  @State() state: ViewState = ViewState.LOADING;

  @State() package: string;

  @State() pieName: string;

  @State() pieController: PieController;

  @State() pieElement: PieElement;

  @State() pieElementModel: Object;

  @State() configElement: PieElement;

  @State() toggled: boolean = this.preview;

  // @Element() private element: HTMLElement

  togglePreview() {
    this.toggled = !this.toggled;
  }

  @Watch('pie')
  watchPie(newPie) {
    console.log('pie-watch triggered');
    this.package = newPie;
    this.pieName = newPie.substr(newPie.lastIndexOf('/') + 1, newPie.length).split('@')[0];

    customElements.whenDefined(this.pieName).then(() => {
      // TODO - what if same element reloaded, could elems be redefined? may need to undefine prior?
      const packageWithoutVersion = this.package.replace(/(?<=[a-z])\@(?:.(?!\@))+$/, '');
      this.pieController = window['pie'].default[packageWithoutVersion].controller;
      if (this.model) this.updateModel(this.model);
      this.state = ViewState.READY;
      console.log('ready ... , set controller as ' + this.pieController);
      
    });

    loadCloudPies({ [this.pieName]: this.package }, document);
  }

  @Watch('model')
  async updateModel(newModel) {
    console.log('model watch triggered');
    if (this.pieController && this.pieElement) {
      this.pieElementModel =  await this.pieController.model(newModel || {}, {}, {});
      this.pieElement.model = this.pieElementModel;
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
      this.model = event.detail && event.detail.update;
    });
  } 


  // configModelUpdated(event: CustomEvent) {
  //   console.log('Received the custom model.updated event: ', event.detail);
  //   this.model = event.detail && event.detail.update;
  // }

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
              <span>
                <button 
                  class="toggle-button"
                  onClick={ () => this.togglePreview()}>
                  {this.toggled ? (
                    <span>Hide Preview</span>
                  ) : (
                    <span>Show Preview</span>
                  )}
                </button>
              </span>
            </span>
            <div class="config-holder">
              <Tagname
                id="render"
                ref={el => (this.pieElement = el as PieElement)}
                model={this.model}
                session={{}}
                style={{ "display": this.toggled ? 'block' : 'none' }}
              />
              <div class="divider" />
              <ConfigTag
                id="configure"
                ref={el => (this.configElement = el as PieElement)}
                model={this.model}
                session={{}}
              />
            </div>
          </div>
        );
    }
  }
}
