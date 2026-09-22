// On macOS, WebKit's Option+Tab includes buttons in native focus navigation
// without changing the user's system keyboard preferences.
export function tabKey(browserName: string, reverse = false) {
  const modifiers = [];
  if (reverse) modifiers.push("Shift");
  if (browserName === "webkit" && process.platform === "darwin")
    modifiers.push("Alt");
  return [...modifiers, "Tab"].join("+");
}
