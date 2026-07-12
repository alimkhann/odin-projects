import { analyzeArray } from "../src/analyzeArray";

describe("analyzeArray", () => {
  test("returns correct analysis for [1,8,3,4,2,6]", () => {
    expect(analyzeArray([1, 8, 3, 4, 2, 6])).toEqual({
      average: 4,
      min: 1,
      max: 8,
      length: 6,
    });
  });

  test("handles an array with one element", () => {
    expect(analyzeArray([5])).toEqual({
      average: 5,
      min: 5,
      max: 5,
      length: 1,
    });
  });

  test("handles negative numbers", () => {
    expect(analyzeArray([-3, -1, -7])).toEqual({
      average: -11 / 3,
      min: -7,
      max: -1,
      length: 3,
    });
  });

  test("returns a decimal average when needed", () => {
    expect(analyzeArray([1, 2])).toEqual({
      average: 1.5,
      min: 1,
      max: 2,
      length: 2,
    });
  });

  test("returns null for an empty array", () => {
    expect(analyzeArray([])).toBeNull();
  });
});
