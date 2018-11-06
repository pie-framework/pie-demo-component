import { PieDemo } from './pie-demo';

describe('pie-demo', () => {
  it('builds', () => {
    expect(new PieDemo()).toBeTruthy();
  });

  describe('default', () => {
    it('sets default params correctly', () => {
      const component = new PieDemo();
      expect(component.editor).toEqual(true);
    });

  });
});
