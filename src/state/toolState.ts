// Favorites and recently used tools, persisted per user via VS Code's globalState.
// Takes a minimal store interface so it can be tested without VS Code.

export interface KeyValueStore {
  get<T>(key: string, defaultValue: T): T;
  update(key: string, value: unknown): PromiseLike<void>;
}

const FAVORITES_KEY = "devtool.favorites";
const RECENT_KEY = "devtool.recent";
export const MAX_RECENT = 5;

export class ToolState {
  constructor(private readonly store: KeyValueStore) {}

  getFavorites(): string[] {
    return this.store.get<string[]>(FAVORITES_KEY, []);
  }

  isFavorite(toolId: string): boolean {
    return this.getFavorites().includes(toolId);
  }

  toggleFavorite(toolId: string): PromiseLike<void> {
    const current = this.getFavorites();
    const next = current.includes(toolId)
      ? current.filter((id) => id !== toolId)
      : [...current, toolId];
    return this.store.update(FAVORITES_KEY, next);
  }

  getRecent(): string[] {
    return this.store.get<string[]>(RECENT_KEY, []);
  }

  markUsed(toolId: string): PromiseLike<void> {
    const next = [toolId, ...this.getRecent().filter((id) => id !== toolId)].slice(0, MAX_RECENT);
    return this.store.update(RECENT_KEY, next);
  }
}
