// URL percent-encoding. Pure logic, no VS Code dependency.

export type UrlMode = "component" | "full";
export type UrlResult = { ok: true; text: string } | { ok: false; message: string };

// "component" encodes everything except unreserved characters (use for query values).
// "full" keeps URL structure characters such as : / ? # & = (use for whole URLs).
export function urlEncode(text: string, mode: UrlMode = "component"): UrlResult {
  return { ok: true, text: mode === "component" ? encodeURIComponent(text) : encodeURI(text) };
}

// plusAsSpace: treat "+" as a space, as HTML form encoding does.
export function urlDecode(text: string, plusAsSpace = false): UrlResult {
  const input = plusAsSpace ? text.replace(/\+/g, " ") : text;
  try {
    return { ok: true, text: decodeURIComponent(input) };
  } catch {
    return { ok: false, message: "Malformed percent-encoding (e.g. a lone % or invalid UTF-8 sequence)." };
  }
}
