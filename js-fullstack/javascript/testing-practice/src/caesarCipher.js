function shiftChar(char, shift) {
  const isUpper = char >= "A" && char <= "Z";
  const isLower = char >= "a" && char <= "z";

  if (!isUpper && !isLower) return char;

  const base = isUpper ? 65 : 97;
  const code = char.charCodeAt(0) - base;
  const shifted = (((code + shift) % 26) + 26) % 26;

  return String.fromCharCode(shifted + base);
}

export function caesarCipher(str, shift) {
  return str
    .split("")
    .map((char) => shiftChar(char, shift))
    .join("");
}
