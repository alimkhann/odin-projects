import { caesarCipher } from "../src/caesarCipher";

describe("caesarCipher", () => {
  test("shifts letters by the given amount", () => {
    expect(caesarCipher("abc", 1)).toBe("bcd");
  });

  test("wraps from z to a", () => {
    expect(caesarCipher("xyz", 3)).toBe("abc");
  });

  test("preserves letter case", () => {
    expect(caesarCipher("HeLLo", 3)).toBe("KhOOr");
  });

  test("keeps punctuation, spaces, and non-alpha characters unchanged", () => {
    expect(caesarCipher("Hello, World!", 3)).toBe("Khoor, Zruog!");
  });

  test("handles a full alphabet shift (26) returning the same string", () => {
    expect(caesarCipher("Hello", 26)).toBe("Hello");
  });

  test("handles negative shifts", () => {
    expect(caesarCipher("bcd", -1)).toBe("abc");
  });

  test("handles a large shift factor", () => {
    expect(caesarCipher("abc", 27)).toBe("bcd");
  });

  test("handles an empty string", () => {
    expect(caesarCipher("", 5)).toBe("");
  });
});
