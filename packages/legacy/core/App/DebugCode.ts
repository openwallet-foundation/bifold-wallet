import { NativeModules, DevSettings } from 'react-native'

const withRemoteDebugger = () => {
  const message = {
    stop: '(*) Stop Debugging',
    debug: '(*) Debug JS Remotely',
  }

  // Check if remote debugging is enabled
  const settingsManager = NativeModules.SettingsManager
  const isDebuggingRemotely =
    settingsManager && settingsManager.settings && settingsManager.settings.RCTDevMenu
      ? !!settingsManager.settings.RCTDevMenu.isDebuggingRemotely
      : false
  if (DevSettings.addMenuItem) {
    DevSettings.addMenuItem(isDebuggingRemotely ? message.stop : message.debug, () => {
      // Toggle debugging state
      if (settingsManager && settingsManager.settings && settingsManager.settings.RCTDevMenu) {
        NativeModules.DevSettings.setIsDebuggingRemotely(!isDebuggingRemotely)
      }

      // Reload is needed for the changes to take effect
      DevSettings.reload()
    })
  } else {
    // eslint-disable-next-line no-console
    console.warn('DevSettings.addMenuItem is not available in this environment.')
  }
}

if (__DEV__) {
  // Add delay to avoid issues with React Native Debugger initialization
  setTimeout(withRemoteDebugger, 100)
}
