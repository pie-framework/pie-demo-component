import { newE2EPage } from '@stencil/core/testing';

describe('pie-demo', () => {
  it('renders', async () => {
    const page = await newE2EPage();

    await page.setContent('<pie-demo></pie-demo>');
    const element = await page.find('pie-demo');
    expect(element).toHaveClass('hydrated');
  });

  it('renders changes to the name data', async () => {
    const page = await newE2EPage();

    await page.setContent('<pie-demo></pie-demo>');
    const component = await page.find('pie-demo');
    const element = await page.find('pie-demo >>> div');
    expect(element.textContent).toEqual(`Hello, World!`);
    // check defaults
    expect(
      await component.getProperty('editor')
      ).toEqual(true);
    expect(
      await component.getProperty('preview')
      ).toEqual(true);  
    expect(
      await component.getProperty('playerControls')
      ).toEqual(true);     
  });
});
