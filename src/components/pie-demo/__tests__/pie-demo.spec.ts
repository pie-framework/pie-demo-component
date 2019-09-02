import { PieDemo } from "../pie-demo";

jest.useFakeTimers();

(global as any).window.setTimeout = jest.fn();
(global as any).setTimeout = jest.fn();

jest.mock("jquery", () => {
  return {};
});
describe("pie-demo", () => {
  it("builds", () => {
    expect(new PieDemo()).toBeTruthy();
  });

  describe("default", () => {
    it("sets default params correctly", () => {
      const component = new PieDemo();
      expect(component.editor).toEqual(true);
    });
  });
});
