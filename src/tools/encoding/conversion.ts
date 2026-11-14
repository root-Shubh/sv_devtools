// Encoding and conversion helpers: HTML entities, Unicode escapes, hex, binary, string escapes.
// Pure logic, no VS Code dependency.

export type Conv = { ok: true; text: string } | { ok: false; message: string };

const HTML_ESCAPES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const HTML_NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

export function htmlEncode(text: string): Conv {
  return { ok: true, text: text.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]) };
}

export function htmlDecode(text: string): Conv {
  const out = text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (code < 0 || code > 0x10ffff) return whole;
      return String.fromCodePoint(code);
    }
    return HTML_NAMED[body] ?? whole;
  });
  return { ok: true, text: out };
}

// Escapes non-ASCII characters as \uXXXX (UTF-16 code units, so astral characters become pairs).
export function unicodeEscape(text: string): Conv {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    out += code < 0x80 ? text[i] : "\\u" + code.toString(16).padStart(4, "0");
  }
  return { ok: true, text: out };
}

// Accepts \uXXXX and \u{X...}.
export function unicodeUnescape(text: string): Conv {
  try {
    return {
      ok: true,
      text: text.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (_w, braced: string, four: string) =>
        String.fromCodePoint(parseInt(braced ?? four, 16))
      )
    };
  } catch {
    return { ok: false, message: "Invalid Unicode escape." };
  }
}

const utf8 = (text: string): Uint8Array => new TextEncoder().encode(text);

export function textToHex(text: string): Conv {
  return { ok: true, text: Array.from(utf8(text), (b) => b.toString(16).padStart(2, "0")).join(" ") };
}

export function hexToText(hex: string): Conv {
  const cleaned = hex.replace(/0x/gi, "").replace(/[\s,]/g, "");
  if (cleaned === "") return { ok: true, text: "" }; // empty encodes to empty, so round trips work
  if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0) {
    return { ok: false, message: "Hex input must be pairs of 0-9 and a-f." };
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(cleaned.substr(i * 2, 2), 16);
  return decodeUtf8(bytes);
}

export function textToBinary(text: string): Conv {
  return { ok: true, text: Array.from(utf8(text), (b) => b.toString(2).padStart(8, "0")).join(" ") };
}

export function binaryToText(bits: string): Conv {
  const cleaned = bits.replace(/[\s,]/g, "");
  if (cleaned === "") return { ok: true, text: "" };
  if (!/^[01]+$/.test(cleaned) || cleaned.length % 8 !== 0) {
    return { ok: false, message: "Binary input must be groups of 8 bits (0 and 1)." };
  }
  const bytes = new Uint8Array(cleaned.length / 8);
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(cleaned.substr(i * 8, 8), 2);
  return decodeUtf8(bytes);
}

function decodeUtf8(bytes: Uint8Array): Conv {
  try {
    return { ok: true, text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { ok: false, message: "Bytes are not valid UTF-8 text." };
  }
}

// String escape in JSON/JavaScript style: \n, \t, \", \\ and \u00XX for control characters.
export function stringEscape(text: string): Conv {
  return { ok: true, text: JSON.stringify(text).slice(1, -1) };
}

// Accepts the same forms, plus \xHH (converted to \u00HH first).
export function stringUnescape(text: string): Conv {
  try {
    const converted = text.replace(/\\x([0-9a-fA-F]{2})/g, "\\u00$1");
    return { ok: true, text: JSON.parse(`"${converted}"`) };
  } catch {
    return { ok: false, message: "Not a valid escaped string." };
  }
}
