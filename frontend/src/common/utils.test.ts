import { debounce, anyTextSearch, strToFloat } from "common/utils";

describe("utils", () => {
  test("debounce", () => {
    jest.useFakeTimers();
    var mockFn = jest.fn();

    var debounceFn = debounce(mockFn, 100);

    debounceFn("not called");
    jest.advanceTimersByTime(70);
    debounceFn("var1", "var2");
    jest.advanceTimersByTime(130);
    debounceFn("var3");
    jest.advanceTimersByTime(101);

    expect(mockFn.mock.calls.length).toBe(2);
    expect(mockFn.mock.calls[0][0]).toBe("var1");
    expect(mockFn.mock.calls[0][1]).toBe("var2");
    expect(mockFn.mock.calls[1][0]).toBe("var3");
  });

  describe.only("strToFloat", () => {
    it("converts string", () => {
      let testCases = [
        { strNum: "-4", result: -4 },
        { strNum: "22", result: 22 },
        { strNum: "25,6", result: 25.6 },
        { strNum: "1,2345", result: 1.2345 },
        { strNum: "1.234,5", result: 1234.5 },
        { strNum: "0", result: 0 },
      ];

      for (const { strNum, result } of testCases) {
        expect(strToFloat(strNum)).toBe(result);
      }
    });

    it("applies precision", () => {
      let testCases = [
        { strNum: "1,2345", precision: 4, result: 1.2345 },
        { strNum: "1,2345", precision: 6, result: 1.2345 },
        { strNum: "1,2345", precision: 3, result: 1.235 },
        { strNum: "1,2345", precision: 1, result: 1.2 },
        { strNum: "1,2345", precision: 0, result: 1 },
        { strNum: "12,345", precision: -1, result: 10 },
      ];

      for (const { strNum, result, precision } of testCases) {
        expect(strToFloat(strNum, precision)).toBe(result);
      }
    });

    it("throws errors for incorrect arguments", () => {
      let testCases = [
        { strNum: "NotANumber", precision: null },
        { strNum: "1,23,45", precision: null },
        { strNum: "123,45", precision: 1.4 },
        { strNum: "zero", precision: 1 },
      ];

      for (const { strNum, precision } of testCases) {
        expect(() => strToFloat(strNum, precision as any)).toThrow();
      }
    });
  });

  describe("anyTextSearch", () => {
    it("filters strings", () => {
      let testCases = [
        { searchItem: "Some Text", filterText: "Me", result: true },
        { searchItem: "SomeText", filterText: "met", result: true },
        { searchItem: "Some Text", filterText: "met", result: false },
      ];

      for (const { searchItem, filterText, result } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBe(result);
      }
    });

    it("filters for every space separated filter", () => {
      let testCases = [
        { searchItem: "Some Text", filterText: "Me xt", result: true },
        { searchItem: "SomeText", filterText: "met xt", result: true },
        { searchItem: "Some Text", filterText: "me not", result: false },
      ];

      for (const { searchItem, filterText, result } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBe(result);
      }
    });

    it("filters strings", () => {
      let testCases = [
        { searchItem: "Some Text", filterText: "Me", result: true },
        { searchItem: "SomeText", filterText: "met", result: true },
        { searchItem: "Some Text", filterText: "met", result: false },
      ];

      for (const { searchItem, filterText, result } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBe(result);
      }
    });

    it("filters numbers in German locale", () => {
      let testCases = [
        { searchItem: 0, filterText: "0", result: true },
        { searchItem: -445, filterText: "-4", result: true },
        { searchItem: 1.45, filterText: "1,45", result: true },
      ];

      for (const { searchItem, filterText, result } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBe(result);
      }
    });

    it("filters lists", () => {
      let testCases = [
        { searchItem: [], filterText: "0", result: false },
        { searchItem: [1, 2, 3], filterText: "3", result: true },
        { searchItem: [null, undefined, "match"], filterText: "ch", result: true },
      ];

      for (const { searchItem, filterText, result } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBe(result);
      }
    });

    it("filters objects by values", () => {
      let testCases = [
        { searchItem: {}, filterText: "0", result: false },
        { searchItem: { key: "value" }, filterText: "key", result: false },
        { searchItem: { key: "value" }, filterText: "val", result: true },
        { searchItem: { key: { key: "value" } }, filterText: "key", result: false },
        { searchItem: { key: { key: "value" } }, filterText: "val", result: true },
        {
          searchItem: { key: { key: "val1", key2: "val2" } },
          filterText: "val1 val2",
          result: true,
        },
      ];

      for (const { searchItem, filterText, result } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBe(result);
      }
    });

    it("does not break for weird primitives", () => {
      let testCases = [
        { searchItem: undefined, filterText: "sth", result: false },
        { searchItem: null, filterText: "sth", result: false },
        { searchItem: true, filterText: "ru", result: false },
      ];

      for (const { searchItem, filterText, result } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBe(result);
      }
    });

    it("return true for empty filterText", () => {
      let testCases = [
        { searchItem: "Some Text", filterText: " " },
        { searchItem: null, filterText: "" },
        { searchItem: 1, filterText: "" },
      ];

      for (const { searchItem, filterText } of testCases) {
        expect(anyTextSearch(searchItem, filterText)).toBeTruthy();
      }
    });
  });
});
