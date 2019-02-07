import { Config } from '@stencil/core';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

export const config: Config = {
  namespace: 'pie-demo',
  plugins: [
    builtins(),
    globals()
  ],
  copy: [
    { src: '../node_modules/docson/public/templates/box.html', dest: 'assets/html/box.html'},
    { src: '../node_modules/docson/public/templates/signature.html', dest: 'assets/html/signature.html'},
    { src: '../node_modules/docson/public/css/docson.css', dest: 'assets/docson.css'},
  ],
  outputTargets:[
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ],
  bundles: [ { components: [ 'pie-demo' ] } ]
};
