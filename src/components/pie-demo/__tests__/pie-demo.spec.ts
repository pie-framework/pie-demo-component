import { PieDemo } from "../pie-demo";

describe("pie-demo", () => {
  it("builds", () => {
    expect(new PieDemo()).toBeTruthy();
  });

  let el: PieDemo;

  beforeEach(() => {
    el = new PieDemo();
  });

  describe("default", () => {
    it("sets default params correctly", () => {
      expect(el.editor).toEqual(true);
    });
  });

  describe("onModelUpdated", () => {
    it("calls update pie model", () => {
      el.updatePieModelFromController = jest.fn();
      el.onModelUpdated({} as any);
      expect(el.updatePieModelFromController).toHaveBeenCalledWith(
        el.configModel,
        el.session,
        el.env
      );
    });
  });
});
