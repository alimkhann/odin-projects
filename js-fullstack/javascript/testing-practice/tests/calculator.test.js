import { calculator } from "../src/calculator";

describe("calculator", () => {
  describe("add", () => {
    test("adds two positive numbers", () => {
      expect(calculator.add(2, 3)).toBe(5);
    });

    test("adds negative numbers", () => {
      expect(calculator.add(-2, -3)).toBe(-5);
    });

    test("adds zero", () => {
      expect(calculator.add(5, 0)).toBe(5);
    });
  });

  describe("subtract", () => {
    test("subtracts two numbers", () => {
      expect(calculator.subtract(10, 4)).toBe(6);
    });

    test("returns a negative result when appropriate", () => {
      expect(calculator.subtract(3, 7)).toBe(-4);
    });
  });

  describe("multiply", () => {
    test("multiplies two numbers", () => {
      expect(calculator.multiply(3, 4)).toBe(12);
    });

    test("multiplies by zero", () => {
      expect(calculator.multiply(5, 0)).toBe(0);
    });

    test("multiplies negative numbers", () => {
      expect(calculator.multiply(-2, 3)).toBe(-6);
    });
  });

  describe("divide", () => {
    test("divides two numbers", () => {
      expect(calculator.divide(10, 2)).toBe(5);
    });

    test("returns a decimal result", () => {
      expect(calculator.divide(7, 2)).toBe(3.5);
    });

    test("throws when dividing by zero", () => {
      expect(() => calculator.divide(5, 0)).toThrow("Cannot divide by zero");
    });
  });
});
