// Turns text into a string literal for a target language, so it can be pasted into code.
// Pure logic, no VS Code dependency.

export type LiteralLanguage = "java" | "csharp" | "python";

// Escapes the characters that end or break a string literal, plus control characters.
// Java and C# use \uXXXX for code units; Python uses \uXXXX for BMP characters and \UXXXXXXXX above.
export function toStringLiteral(text: string, lang: LiteralLanguage): string {
  let out = "";
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    switch (ch) {
      case "\\": out += "\\\\"; break;
      case '"': out += '\\"'; break;
      case "\n": out += "\\n"; break;
      case "\r": out += "\\r"; break;
      case "\t": out += "\\t"; break;
      default:
        if (cp < 0x20 || cp === 0x7f) {
          out += "\\u" + cp.toString(16).padStart(4, "0");
        } else if (lang === "python" && cp > 0xffff) {
          out += "\\U" + cp.toString(16).padStart(8, "0");
        } else if (cp > 0x7e && lang !== "python") {
          // Java and C# source files may not be UTF-8 everywhere, so escape non-ASCII.
          out += cp > 0xffff ? surrogatePair(cp) : "\\u" + cp.toString(16).padStart(4, "0");
        } else {
          out += ch;
        }
    }
  }
  return `"${out}"`;
}

function surrogatePair(cp: number): string {
  const v = cp - 0x10000;
  const hi = 0xd800 + (v >> 10);
  const lo = 0xdc00 + (v & 0x3ff);
  return "\\u" + hi.toString(16) + "\\u" + lo.toString(16);
}
