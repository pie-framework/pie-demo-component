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
    
    expect(pieDemo).toHaveClass('hydrated');
  });

  it('is in loading mode until element loaded', async () => {
    // TODO use >>> for shadowroot e.g. `pie-demo >>> #loading`, but shadow
    // is disabled currently as it breaks css for MUI.
    const loading = await page.find('.root.loading');
    expect(loading.innerHTML).toEqual('<div class="lmask"></div>');

  });


  it('loads the script and registers', async () => {

    await setupInterceptPieCloud(page, pie);

    pieDemo.setProperty('pie', pie);
    await page.waitForChanges();
    
    expect(
      await pieDemo.getProperty('pie')
      ).toEqual(pie);

    const pieScript = await page.find('script#multiple-choice');
    expect(pieScript).toBeDefined();    
  });

  it('loads the model and renders the element', async () => {
    await setupInterceptPieCloud(page, pie);
    
    pieDemo.setProperty('pie', pie);
    await page.waitForChanges();
    const pieElement = await page.waitForSelector('pie-demo multiple-choice');
    expect(pieElement).toBeDefined();
    pieDemo.setProperty('model', model('1', "multiple-choice"));

    await page.waitForChanges();
    const modelSet = await page.$eval('pie-demo multiple-choice', (el) => el.getAttribute('model'));
    expect(modelSet).toBeTruthy();
  });


});
