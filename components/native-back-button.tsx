'use client';

import { useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  handleNativeBack,
  isAndroidCapacitor,
  readNativeHistoryIndex,
  withNativeHistoryIndex,
} from '@/lib/native-history';

export default function NativeBackButton() {
  useEffect(() => {
    if (!isAndroidCapacitor(Capacitor.isNativePlatform(), Capacitor.getPlatform())) return;

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);
    let currentIndex = readNativeHistoryIndex(window.history.state);
    let listener: PluginListenerHandle | undefined;
    let disposed = false;

    const trackedPushState: History['pushState'] = (data, unused, url) => {
      currentIndex += 1;
      originalPushState(withNativeHistoryIndex(data, currentIndex), unused, url);
    };
    const trackedReplaceState: History['replaceState'] = (data, unused, url) => {
      originalReplaceState(withNativeHistoryIndex(data, currentIndex), unused, url);
    };
    const handlePopState = (event: PopStateEvent) => {
      currentIndex = readNativeHistoryIndex(event.state);
    };

    originalReplaceState(
      withNativeHistoryIndex(window.history.state, currentIndex),
      '',
      window.location.href,
    );
    window.history.pushState = trackedPushState;
    window.history.replaceState = trackedReplaceState;
    window.addEventListener('popstate', handlePopState);

    void App.addListener('backButton', () => {
      handleNativeBack(window.location.pathname, currentIndex, {
        back: () => window.history.back(),
        minimize: () => void App.minimizeApp(),
      });
    }).then((handle) => {
      if (disposed) {
        void handle.remove();
        return;
      }

      listener = handle;
    });

    return () => {
      disposed = true;
      void listener?.remove();
      window.removeEventListener('popstate', handlePopState);

      if (window.history.pushState === trackedPushState) {
        window.history.pushState = originalPushState;
      }
      if (window.history.replaceState === trackedReplaceState) {
        window.history.replaceState = originalReplaceState;
      }
    };
  }, []);

  return null;
}
