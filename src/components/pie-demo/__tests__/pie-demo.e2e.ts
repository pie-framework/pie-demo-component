import { newE2EPage, E2EElement } from '@stencil/core/testing';
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
  it('renders', async () => {
    
    const page = await newE2EPage();
    await page.setContent('<pie-demo></pie-demo>');
    const element = await page.find('pie-demo');
    expect(element).toHaveClass('hydrated');
  });

  it('is in loading mode until element loaded', async () => {
    const page = await newE2EPage();
    await page.setContent('<pie-demo></pie-demo>');
    // >>> for shadowroot
    const loading = await page.find('pie-demo >>> #loading');
    expect(loading.textContent).toEqual(`Loading...`);

  });

  it('loads the script and registers', async () => {
    const pie = '@pie-elements/multiple-choice';
    const page = await newE2EPage();

    await setupInterceptPieCloud(page, pie);
    
    await page.setContent('<pie-demo></pie-demo>');
    const comp = await page.find('pie-demo');
    comp.setProperty('pie', pie);
    await page.waitForChanges();

    expect(
      await comp.getProperty('pie')
      ).toEqual(pie);

    const pieScript = await page.find('script#multiple-choice');
    console.log(`pieScript src = ${pieScript.getAttribute("src")}`)
    expect(pieScript).toBeDefined();


    // await page.waitForEvent("made-up-event");
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
