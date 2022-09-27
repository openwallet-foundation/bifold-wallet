type uiConfigType = {
  showTabLabel: boolean
  fiveTabDisplay: boolean
  navigateOnConnection: boolean
  allowQrDisplay: boolean
  focusScanTab: boolean
}

export const uiConfig: uiConfigType = {
  // Determines if the scan tab will display a text label
  showTabLabel: true,
  // Determines if the tab bar will display 5 tabs or only 3
  fiveTabDisplay: true,
  // Determines if the app will navigate to the chat screen upon connection or wait for a notification
  navigateOnConnection: false,
  // If true, allows the user to display their own invite QR code
  allowQrDisplay: true,
  // Determines if the scan tab will have a highlight circle around it
  focusScanTab: false,
}
