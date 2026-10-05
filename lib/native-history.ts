export const NATIVE_HISTORY_INDEX_KEY = '__paroquiaNativeHistoryIndex';

export function readNativeHistoryIndex(state: unknown) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) return 0;

  const value = (state as Record<string, unknown>)[NATIVE_HISTORY_INDEX_KEY];
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function withNativeHistoryIndex(state: unknown, index: number): Record<string, unknown> {
  const safeIndex = Number.isSafeInteger(index) && index >= 0 ? index : 0;
  const currentState =
    state && typeof state === 'object' && !Array.isArray(state)
      ? (state as Record<string, unknown>)
      : {};

  return { ...currentState, [NATIVE_HISTORY_INDEX_KEY]: safeIndex };
}
