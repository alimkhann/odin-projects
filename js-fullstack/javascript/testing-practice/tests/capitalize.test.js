import { capitalize } from "../src/capitalize";

describe("capitalize", () => {
  test("capitalizes the first character of a lowercase word", () => {
    expect(capitalize("hello")).toBe("Hello");
  });

  test("keeps an already capitalized string unchanged", () => {
    expect(capitalize("Hello")).toBe("Hello");
  });

  test("works with a single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  test("returns an empty string when given an empty string", () => {
    expect(capitalize("")).toBe("");
  });

  test("does not change characters after the first", () => {
    expect(capitalize("hELLO")).toBe("HELLO");
  });
});
