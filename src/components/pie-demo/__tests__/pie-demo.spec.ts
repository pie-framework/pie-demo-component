import { PieDemoContent } from "../pie-demo-content";

describe("pie-demo-content", () => {
  it("builds", () => {
    expect(new PieDemoContent()).toBeTruthy();
  });

  let el: PieDemoContent;

  beforeEach(() => {
    el = new PieDemoContent();
  });

  describe("default", () => {
    it("sets default params correctly", () => {
      expect(el.editor).toEqual(true);
    });
  });

  // describe("onModelUpdated", () => {
  //   it("calls update pie model", () => {
  //     el.updatePieModelFromController = jest.fn();
  //     el.onModelUpdated({} as any);
  //     expect(el.updatePieModelFromController).toHaveBeenCalledWith(
  //       el.configModel,
  //       el.session,
  //       el.env
  //     );
  //   });
  // });
});
