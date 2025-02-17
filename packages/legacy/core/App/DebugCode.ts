import { NativeModules, DevSettings } from 'react-native'

const withRemoteDebugger = () => {
  const message = {
    stop: '(*) Stop Debugging',
    debug: '(*) Debug JS Remotely',
  }

  // Check if remote debugging is enabled
  const isDebuggingRemotely = !!NativeModules.SettingsManager.settings.RCTDevMenu.isDebuggingRemotely
  DevSettings.addMenuItem(isDebuggingRemotely ? message.stop : message.debug, () => {
    // Toggle debugging state
    NativeModules.DevSettings.setIsDebuggingRemotely(!isDebuggingRemotely)

    // Reload is needed for the changes to take effect
    DevSettings.reload()
  })
}

if (__DEV__) {
  // Add delay to avoid issues with React Native Debugger initialization
  setTimeout(withRemoteDebugger, 100)
}
