import { Component, Prop, Watch, State} from '@stencil/core';
import {loadCloudPies} from '../../util/PieCloud';

enum ViewState {
  LOADING,
  READY,
  ERROR
};

@Component({
  tag: 'pie-demo',
  styleUrl: 'pie-demo.css',
  shadow: true
})
export class PieDemo {
  /**
   * The PIE npm package to demo. e.g. `@pie-elements/multiple-choice`
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
  @Prop() model: string;


  @State() state: ViewState = ViewState.LOADING;

  @State() package: string;

  @State() pieName: string;

  @Watch('pie')
  watchPie(newPie) {
    console.log('pie-watch triggered');
    this.package = newPie;
    this.pieName = newPie.substr(newPie.lastIndexOf('/') +1, newPie.length);
    
    customElements.whenDefined(this.pieName).then(() => {
      // TODO - what if reloaded, can elems be redefined
      this.state = ViewState.READY;
      console.log('ready ... ');
    });

    loadCloudPies({[this.pieName]: this.package}, document);
  }

  @Watch('model')
  validateConfig(newConfig: string) {
    if (!newConfig) { 
      this.state = ViewState.LOADING;
     };
  }

  componentWillLoad() {
    console.log('component will load ... ');
    this.watchPie(this.pie);
  }

  render() {
    switch(this.state) {
      case ViewState.LOADING:
        return <div id="loading">Loading...</div>;
      case ViewState.ERROR:
        return <div id="error">Error...</div>;
      case ViewState.READY:
        console.log('rendering');
        return <multiple-choice>

        </multiple-choice>;  
    }
   
    
  }
}
