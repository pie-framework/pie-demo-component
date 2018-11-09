import { Component, Prop, Watch, State} from '@stencil/core';
import {loadCloudPies} from '../../util/PieCloud';

enum ViewState {
  LOADING,
  READY,
  ERROR
};

type PieController = {
  model: (config:Object, session:Object, env:Object) => Promise<Object>
  score: (config:Object, session:Object, env:Object) => Promise<Object>
}

interface PieElement extends HTMLElement  {
  model: Object
  session: Object
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

  @State() state: ViewState = ViewState.LOADING;

  @State() package: string;

  @State() pieName: string;

  @State() pieController: PieController;

  @State() pieElement: PieElement;

  // @Element() private element: HTMLElement

  @Watch('pie')
  watchPie(newPie) {
    console.log('pie-watch triggered');
    this.package = newPie;
    this.pieName = newPie.substr(newPie.lastIndexOf('/') +1, newPie.length);
    
    customElements.whenDefined(this.pieName).then(() => {
      // TODO - what if same element reloaded, could elems be redefined? may need to undefine prior?
      
      this.pieController = window['pie'].default[this.package].controller;
      if (this.model) this.updateModel(this.model);
      this.state = ViewState.READY;
      console.log('ready ... , set controller as ' + this.pieController);
    });

    loadCloudPies({[this.pieName]: this.package}, document);
  }

  @Watch('model')
  updateModel(newModel) {
    console.log('model watch triggered');
    if (this.pieController && this.pieElement) {
      const parsedModel = this.pieController.model(newModel || {}, {}, {});
      this.pieElement.model = parsedModel; 
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

  render() {
    switch(this.state) {
      case ViewState.LOADING:
        return <div id="loading">Loading...</div>;
      case ViewState.ERROR:
        return <div id="error">Error...</div>;
      case ViewState.READY:
        console.log('rendering');
        return <multiple-choice 
          ref={(el) => this.pieElement = el as PieElement} 
          model={this.model} 
          session={{}}>

        </multiple-choice>;  
    }
   
    
  }
}
