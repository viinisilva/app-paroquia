export function isIosDevice(userAgent: string, platform: string, maxTouchPoints: number) {
  return /iPad|iPhone|iPod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);
}

export function isStandaloneMode(
  displayModeStandalone: boolean,
  navigatorStandalone: boolean | undefined,
) {
  return displayModeStandalone || navigatorStandalone === true;
}
