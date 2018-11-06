import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'pie-demo',
  outputTargets:[
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
};
