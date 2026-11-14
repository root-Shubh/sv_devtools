// Ready-made patterns. Each is written for JavaScript; check the engine note before using elsewhere.
// `valid` and `invalid` examples are used by the tests to confirm each pattern does what it says.

export interface LibraryPattern {
  id: string;
  label: string;
  pattern: string;
  flags: string;
  valid: string[];
  invalid: string[];
}

export const LIBRARY: readonly LibraryPattern[] = [
  {
    id: "email",
    label: "Email address",
    pattern: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
    flags: "",
    valid: ["a.b@example.com", "user+tag@sub.domain.org"],
    invalid: ["plain", "a@b", "@x.com"]
  },
  {
    id: "phone",
    label: "Phone number (international, loose)",
    pattern: "^\\+?[0-9][0-9 ()-]{6,18}[0-9]$",
    flags: "",
    valid: ["+1 (555) 123-4567", "020 7946 0958"],
    invalid: ["12", "abc-def-ghij"]
  },
  {
    id: "url",
    label: "HTTP(S) URL",
    pattern: "^https?:\\/\\/[^\\s/$.?#][^\\s]*$",
    flags: "i",
    valid: ["https://example.com", "http://a.b/path?x=1"],
    invalid: ["ftp://x.com", "example.com", "https://"]
  },
  {
    id: "ipv4",
    label: "IPv4 address",
    pattern: "^((25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)$",
    flags: "",
    valid: ["192.168.0.1", "0.0.0.0", "255.255.255.255"],
    invalid: ["256.1.1.1", "1.2.3", "a.b.c.d"]
  },
  {
    id: "date-iso",
    label: "Date (YYYY-MM-DD)",
    pattern: "^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$",
    flags: "",
    valid: ["2026-11-14", "1999-01-31"],
    invalid: ["2026-13-01", "14/11/2026", "2026-00-10"]
  },
  {
    id: "uuid",
    label: "UUID (any version)",
    pattern: "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    flags: "",
    valid: ["123e4567-e89b-12d3-a456-426614174000"],
    invalid: ["123e4567e89b12d3a456426614174000", "xyz"]
  },
  {
    id: "integer",
    label: "Integer (optional sign)",
    pattern: "^[+-]?\\d+$",
    flags: "",
    valid: ["0", "-42", "+7"],
    invalid: ["1.5", "", "abc"]
  },
  {
    id: "decimal",
    label: "Decimal number",
    pattern: "^[+-]?(\\d+\\.?\\d*|\\.\\d+)$",
    flags: "",
    valid: ["3.14", "-0.5", ".5", "10"],
    invalid: ["1.2.3", "abc", "--1"]
  },
  {
    id: "alphanumeric",
    label: "Alphanumeric only",
    pattern: "^[A-Za-z0-9]+$",
    flags: "",
    valid: ["abc123", "ABC"],
    invalid: ["abc 123", "a_b", ""]
  },
  {
    id: "whitespace-trim",
    label: "Leading or trailing whitespace",
    pattern: "^\\s+|\\s+$",
    flags: "",
    valid: [" x", "x "],
    invalid: ["x", "x y"]
  },
  {
    id: "html-tag",
    label: "HTML tag (simple)",
    pattern: "<\\/?[A-Za-z][A-Za-z0-9-]*(\\s[^>]*)?\\/?>",
    flags: "",
    valid: ["<div>", "</p>", "<br/>", '<a href="x">'],
    invalid: ["plain text", "<>", "< div>"]
  },
  {
    id: "strong-password",
    label: "Password: 8+ chars with upper, lower, digit and symbol",
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
    flags: "",
    valid: ["Passw0rd!", "Abcdef1#"],
    invalid: ["password", "PASSWORD1!", "Ab1!"]
  },
  {
    id: "hex-color",
    label: "Hex colour (#RGB or #RRGGBB)",
    pattern: "^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$",
    flags: "",
    valid: ["#fff", "#A1B2C3"],
    invalid: ["#ffff", "fff", "#GGG"]
  }
];

export function findLibraryPattern(id: string): LibraryPattern | undefined {
  return LIBRARY.find((p) => p.id === id);
}
