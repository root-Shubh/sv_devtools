// Lazy tool loading. A tool's module is only imported the first time it is opened,
// so activation stays cheap. Each entry resolves to the tool's own module.

export interface ToolModule {
  run(): Promise<void>;
}

export type ToolLoader = () => Promise<ToolModule>;

const loaders = new Map<string, ToolLoader>();
const cache = new Map<string, Promise<ToolModule>>();

export function registerTool(toolId: string, loader: ToolLoader): void {
  loaders.set(toolId, loader);
}

export function hasTool(toolId: string): boolean {
  return loaders.has(toolId);
}

// Loads a tool once and reuses the same module on later calls.
export function loadTool(toolId: string): Promise<ToolModule> | undefined {
  const loader = loaders.get(toolId);
  if (!loader) {
    return undefined;
  }
  let pending = cache.get(toolId);
  if (!pending) {
    pending = loader();
    cache.set(toolId, pending);
    // Do not keep a failed load cached, so the next attempt can retry.
    pending.catch(() => cache.delete(toolId));
  }
  return pending;
}

// For tests only.
export function resetLoaders(): void {
  loaders.clear();
  cache.clear();
}
