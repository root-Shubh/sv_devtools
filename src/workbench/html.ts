// HTML for the Workbench webview. Pure string building, so it can be tested without VS Code.
// Colours come from VS Code theme variables only, so the panel follows dark, light and high-contrast themes.

export interface WorkbenchOptions {
  nonce: string;
  cspSource: string;
  transforms: { id: string; label: string; group: string }[];
  initialInput: string;
}

const escapeHtml = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Safe to embed in a <script> block: stops "</script>" and HTML characters from ending the block.
export function jsonForScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function buildWorkbenchHtml(o: WorkbenchOptions): string {
  const groups = [...new Set(o.transforms.map((t) => t.group))];
  const options = groups
    .map((g) => {
      const items = o.transforms
        .filter((t) => t.group === g)
        .map((t) => `<option value="${escapeHtml(t.id)}">${escapeHtml(t.label)}</option>`)
        .join("");
      return `<optgroup label="${escapeHtml(g)}">${items}</optgroup>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${o.cspSource} 'nonce-${o.nonce}'; script-src 'nonce-${o.nonce}';">
<title>Dev Tool Workbench</title>
<style nonce="${o.nonce}">
  :root { color-scheme: light dark; }
  body {
    margin: 0; padding: 12px 16px 16px;
    font-family: var(--vscode-font-family); font-size: var(--vscode-font-size);
    color: var(--vscode-foreground); background: var(--vscode-editor-background);
  }
  header { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
  h1 { font-size: 1.05em; font-weight: 600; margin: 0 auto 0 0; }
  select, button, textarea {
    font: inherit; border-radius: 3px;
  }
  select {
    min-width: 220px; padding: 4px 6px;
    color: var(--vscode-dropdown-foreground); background: var(--vscode-dropdown-background);
    border: 1px solid var(--vscode-dropdown-border);
  }
  button {
    padding: 4px 12px; cursor: pointer; border: 1px solid transparent;
    color: var(--vscode-button-foreground); background: var(--vscode-button-background);
  }
  button:hover { background: var(--vscode-button-hoverBackground); }
  button.secondary {
    color: var(--vscode-button-secondaryForeground); background: var(--vscode-button-secondaryBackground);
  }
  button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
  button:focus-visible, select:focus-visible, textarea:focus-visible {
    outline: 1px solid var(--vscode-focusBorder); outline-offset: 2px;
  }
  .panes { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 640px) { .panes { grid-template-columns: 1fr; } }
  .pane { display: flex; flex-direction: column; min-width: 0; }
  .pane-title {
    display: flex; justify-content: space-between; align-items: baseline;
    font-size: 0.9em; color: var(--vscode-descriptionForeground); margin-bottom: 4px;
  }
  textarea, pre {
    flex: 1; min-height: 320px; margin: 0; padding: 8px; box-sizing: border-box;
    font-family: var(--vscode-editor-font-family); font-size: var(--vscode-editor-font-size);
    color: var(--vscode-input-foreground); background: var(--vscode-input-background);
    border: 1px solid var(--vscode-input-border, transparent);
    white-space: pre-wrap; word-break: break-word; overflow: auto;
  }
  textarea { resize: vertical; }
  pre.output { color: var(--vscode-editor-foreground); }
  pre.output.error { color: var(--vscode-errorForeground); }
  .status { min-height: 1.4em; margin-top: 8px; font-size: 0.9em; color: var(--vscode-descriptionForeground); }
  .status.error { color: var(--vscode-errorForeground); }
  .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
  .hint { color: var(--vscode-descriptionForeground); font-size: 0.85em; }
</style>
</head>
<body>
<header>
  <h1>Dev Tool Workbench</h1>
  <label for="tool" class="hint">Tool</label>
  <select id="tool" aria-label="Tool">${options}</select>
  <button id="swap" class="secondary" type="button" title="Move output into input">Swap</button>
  <button id="clear" class="secondary" type="button">Clear</button>
</header>

<div class="panes">
  <section class="pane" aria-labelledby="in-title">
    <div class="pane-title"><span id="in-title">Input</span><span class="hint" id="in-count">0 chars</span></div>
    <textarea id="input" spellcheck="false" aria-describedby="hint" placeholder="Paste or type text here. Output updates as you type."></textarea>
  </section>
  <section class="pane" aria-labelledby="out-title">
    <div class="pane-title"><span id="out-title">Output</span><span class="hint" id="out-count"></span></div>
    <pre id="output" class="output" aria-live="polite" tabindex="0"></pre>
  </section>
</div>

<div class="actions">
  <button id="copy" type="button">Copy output</button>
  <button id="replace" class="secondary" type="button">Replace selection in editor</button>
</div>
<div id="status" class="status" role="status"></div>
<p id="hint" class="hint">Tip: pick a tool, then type or paste. Replacing changes the editor only when you click the button.</p>

<script nonce="${o.nonce}">
(function () {
  var vscode = acquireVsCodeApi();
  var tool = document.getElementById('tool');
  var input = document.getElementById('input');
  var output = document.getElementById('output');
  var status = document.getElementById('status');
  var inCount = document.getElementById('in-count');
  var outCount = document.getElementById('out-count');
  var latest = { ok: true, text: '' };
  var timer = null;

  function setStatus(message, isError) {
    status.textContent = message || '';
    status.className = 'status' + (isError ? ' error' : '');
  }

  function render(result) {
    latest = result;
    if (result.ok) {
      output.textContent = result.text;
      output.className = 'output';
      outCount.textContent = result.text ? result.text.length + ' chars' : '';
      setStatus('');
    } else {
      output.textContent = '';
      output.className = 'output error';
      outCount.textContent = '';
      setStatus(result.message, true);
    }
  }

  function request() {
    inCount.textContent = input.value.length + ' chars';
    clearTimeout(timer);
    timer = setTimeout(function () {
      vscode.postMessage({ type: 'transform', id: tool.value, input: input.value });
    }, 150);
  }

  input.addEventListener('input', request);
  tool.addEventListener('change', request);

  document.getElementById('swap').addEventListener('click', function () {
    if (!latest.ok) { setStatus('Nothing to swap: the output is an error.', true); return; }
    input.value = latest.text;
    request();
  });

  document.getElementById('clear').addEventListener('click', function () {
    input.value = '';
    request();
    input.focus();
  });

  document.getElementById('copy').addEventListener('click', function () {
    if (!latest.ok || !latest.text) { setStatus('Nothing to copy yet.', true); return; }
    vscode.postMessage({ type: 'copy', text: latest.text });
  });

  document.getElementById('replace').addEventListener('click', function () {
    if (!latest.ok) { setStatus('Fix the error before replacing.', true); return; }
    vscode.postMessage({ type: 'replace', text: latest.text });
  });

  window.addEventListener('message', function (event) {
    var msg = event.data;
    if (msg.type === 'result') render(msg.result);
    if (msg.type === 'status') setStatus(msg.message, !!msg.error);
    if (msg.type === 'init') { input.value = msg.input; request(); }
  });

  // Initial state from the extension.
  input.value = ${jsonForScript(o.initialInput)};
  inCount.textContent = input.value.length + ' chars';
  request();
  input.focus();
})();
</script>
</body>
</html>`;
}
