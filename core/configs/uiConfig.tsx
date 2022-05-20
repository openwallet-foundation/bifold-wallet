export const showScanLabel = true
export const fiveTabDisplay = true
export const navigateOnConnection = true

type uiConfigType = {
  showScanLabel: boolean,
  fiveTabDisplay: boolean,
  navigateOnConnection: boolean,
}

export const uiConfig: uiConfigType = {
  // Determines if the scan tab will display a text label
  showScanLabel: true,
  // Determines if the tab bar will display 5 tabs or only 3
  fiveTabDisplay: true,
  // Determines if the app will navigate to the chat screen upon connection or wait for a notification
  navigateOnConnection: true
}