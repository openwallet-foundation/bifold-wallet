import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'
import Link from '../components/texts/Link'
import { whereToUseWalletUrl } from '../constants';

const ScanHelp: React.FC = () => {
  const { t } = useTranslation()

  const { TextTheme } = useTheme()
  const style = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: 26
    },
    text: {
      ...TextTheme.normal,
      marginTop: 15 
    }
  })

  return (
    <SafeAreaView style={style.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={style.scrollView}>
        <Text style={ TextTheme.headingThree}>What QR Codes can be scanned?</Text>
        <Text style={[ style.text, { marginTop: 20 }]}>Only special QR codes can be scanned by Bifold Wallet.</Text>
        <Text style={style.text}>These are presented by participating services or people to receive a credential offer, request for information or to connect.</Text>
        <Link 
          linkText={'See where you can use Bifold Wallet'}
          style={style.text}
          onPress={ () => Linking.openURL(whereToUseWalletUrl)}
        />
        <Text style={style.text}>Bifold Wallet currently doesn't support adding digital credential by scanning or taking photos of physical ones.</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ScanHelp
