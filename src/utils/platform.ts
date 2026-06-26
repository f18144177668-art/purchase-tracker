export const isNativeApp = (): boolean => {
  return (
    typeof (window as any).Capacitor !== 'undefined' ||
    (window as any).capacitor !== undefined ||
    document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1
  );
};
