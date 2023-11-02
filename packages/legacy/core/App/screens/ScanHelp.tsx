import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

const ScanHelp: React.FC = () => {
  const { t } = useTranslation()

  const {  OnboardingTheme} = useTheme()
  const style = StyleSheet.create({
    foo: {
      ...OnboardingTheme.container,
      height: '100%',
      padding: 20,
      justifyContent: 'space-between',
    },
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text>What QR Codes can be scanned?</Text>
        <Text>Only special QR codes can be scanned by BC Wallet.</Text>
        <Text>These are presented by participating services or people to receive a credential offer, request for information or to connect.</Text>
        <Text>See where you can use BC Wallet</Text>
        <Text>BC Wallet currently doesn't support adding digital credential by scanning or taking photos of physical ones.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ScanHelp
