import { newE2EPage, E2EElement, E2EPage } from '@stencil/core/testing';
import {model} from './config.js';

const fs = require('fs');

const mockPieCloudResponseContent  = fs.readFileSync(__dirname + '/mockPieCloudResponse.js');

const setupInterceptPieCloud = (page, match):Promise<void> => { 
  page.on('request', (request) => {
    // mock the response from pie cloud
    if (request.url().match(match)) {
      request.respond({
        status: 200,
        contentType: 'application/javascript',
        body: mockPieCloudResponseContent
      });
    } else  {
      request.continue();
    }
  });
  return page.setRequestInterception(true);
}

describe('pie-demo', () => {

  let page: E2EPage, pieDemo:E2EElement;
  const pie = '@pie-element/multiple-choice';
  beforeEach(async () => {
    page = await newE2EPage();
    await page.setContent('<pie-demo></pie-demo>');
    pieDemo = await page.find('pie-demo');
  });


  it('renders', async () => {
    
    // const page = await newE2EPage();
    // await page.setContent('<pie-demo></pie-demo>');
    // const element = await page.find('pie-demo');
    expect(pieDemo).toHaveClass('hydrated');
  });

  it('is in loading mode until element loaded', async () => {
    // const page = await newE2EPage();
    // await page.setContent('<pie-demo></pie-demo>');

    // TODO use >>> for shadowroot e.g. `pie-demo >>> #loading`, but shadow
    // is disabled currently as it breaks css for MUI.
    const loading = await page.find('pie-demo #loading');
    expect(loading.textContent).toEqual(`Loading...`);

  });


  it('loads the script and registers', async () => {
    // const pie = '@pie-element/multiple-choice';
    // const page = await newE2EPage();

    await setupInterceptPieCloud(page, pie);
    
    // await page.setContent('<pie-demo></pie-demo>');
    // const comp = await page.find('pie-demo');
    pieDemo.setProperty('pie', pie);
    await page.waitForChanges();
    
    expect(
      await pieDemo.getProperty('pie')
      ).toEqual(pie);

    const pieScript = await page.find('script#multiple-choice');
    expect(pieScript).toBeDefined();


    // await page.waitForEvent("made-up-event");
    
  });

  it('loads the model and renders the element', async () => {
    await setupInterceptPieCloud(page, pie);
    
    // await page.setContent('<pie-demo></pie-demo>');
    // const comp = await page.find('pie-demo');
    pieDemo.setProperty('pie', pie);
    await page.waitForChanges();
    const pieElement = await page.waitForSelector('pie-demo multiple-choice');
    expect(pieElement).toBeDefined();
    // (pieDemo as any).model = model('1', "multiple-choice");
    pieDemo.setProperty('model', model('1', "multiple-choice"));
    // console.log('setting model');
    // pieElement.model = model('1', "multiple-choice");
    // console.log('after setting model');
    await page.waitForChanges();
    console.log('getting model attribuet');
    const modelSet = await page.$eval('pie-demo multiple-choice', (el) => el.getAttribute('model'));
    console.log('after getting model attr ' + JSON.stringify(modelSet));
    // console.log('pieElement' + pieElement.);
    expect(modelSet).toBeTruthy();
  });

  // it('renders changes to the name data', async () => {
  //   const page = await newE2EPage();

  //   await page.setContent('<pie-demo></pie-demo>');
  //   const component = await page.find('pie-demo');
  //   const element = await page.find('pie-demo >>> div');
  //   expect(element.textContent).toEqual(`Hello, World!`);
  //   // check defaults
  //   expect(
  //     await component.getProperty('editor')
  //     ).toEqual(true);
  //   expect(
  //     await component.getProperty('preview')
  //     ).toEqual(true);  
  //   expect(
  //     await component.getProperty('playerControls')
  //     ).toEqual(true);     
  // });
});
