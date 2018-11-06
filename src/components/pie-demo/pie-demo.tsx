import { Component, Prop, Watch } from '@stencil/core';

@Component({
  tag: 'pie-demo',
  styleUrl: 'pie-demo.css',
  shadow: true
})
export class PieDemo {
  @Prop() pie: string;
  @Prop() editor: boolean = true;
  @Prop() preview: boolean = true;
  @Prop() playerControls: boolean = true;
  @Prop() config: string;



  @Watch('config')
  validateConfig(newConfig: string) {
    if (!newConfig) { 
      // try getting config from pie element standard location
     };
  }

  render() {
    return <div>Hello, World!</div>;
  }
}
