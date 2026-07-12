import { reverseString } from "../src/reverseString";

describe("reverseString", () => {
  test("reverses a simple word", () => {
    expect(reverseString("hello")).toBe("olleh");
  });

  test("reverses a string with spaces", () => {
    expect(reverseString("hello world")).toBe("dlrow olleh");
  });

  test("returns an empty string when given an empty string", () => {
    expect(reverseString("")).toBe("");
  });

  test("reverses a single character", () => {
    expect(reverseString("a")).toBe("a");
  });

  test("reverses a palindrome to itself", () => {
    expect(reverseString("racecar")).toBe("racecar");
  });
});
