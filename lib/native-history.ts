export const NATIVE_HISTORY_INDEX_KEY = '__paroquiaNativeHistoryIndex';

const NATIVE_APP_ROOT_PATHS = new Set(['/', '/dashboard', '/inicio']);

export type NativeBackActions = {
  back: () => void;
  minimize: () => void;
};

export function isAndroidCapacitor(isNativePlatform: boolean, platform: string) {
  return isNativePlatform && platform === 'android';
}

export function handleNativeBack(
  pathname: string,
  historyIndex: number,
  actions: NativeBackActions,
) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;

  if (NATIVE_APP_ROOT_PATHS.has(normalizedPath) || historyIndex <= 0) {
    actions.minimize();
    return;
  }

  actions.back();
}

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
