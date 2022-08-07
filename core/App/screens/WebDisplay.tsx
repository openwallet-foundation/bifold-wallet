import { StackScreenProps } from '@react-navigation/stack'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { WebView, WebViewNavigation } from 'react-native-webview'

import { HomeStackParams, Screens } from '../types/navigators'

type WebDisplayProps = StackScreenProps<HomeStackParams, Screens.WebDisplay>

const WebDisplay: React.FC<WebDisplayProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('WebDisplay route prams were not set properly')
  }

  const { destUrl, exitUrl } = route?.params

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    container2: {
      flex: 1,
    },
  })

  return (
    <SafeAreaView style={styles.container2}>
      <WebView
        style={styles.container}
        source={{ uri: destUrl }}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onNavigationStateChange={(nav: WebViewNavigation) => {
          if (exitUrl && nav.url.includes(exitUrl)) {
            navigation.pop()
          }
        }}
      />
    </SafeAreaView>
  )
}

export default WebDisplay
