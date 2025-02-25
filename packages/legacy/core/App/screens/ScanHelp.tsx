import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Link from '../components/texts/Link'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'
import { ThemedText } from '../components/texts/ThemedText'

const ScanHelp: React.FC = () => {
  const { t } = useTranslation()
  const [{ whereToUseWalletUrl }] = useServices([TOKENS.CONFIG])

  const style = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
      padding: 26,
    },
    text: {
      marginTop: 15,
    },
  })

  return (
    <SafeAreaView style={style.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={style.scrollView}>
        <ThemedText variant="headingThree">{t('Scan.WhatToScan')}</ThemedText>
        <ThemedText style={[style.text, { marginTop: 20 }]}>{t('Scan.ScanOnySpecial')}</ThemedText>
        <ThemedText style={style.text}>{t('Scan.ScanOnlySpecial2')}</ThemedText>
        {whereToUseWalletUrl && (
          <Link
            linkText={t('Scan.WhereToUseLink')}
            style={style.text}
            onPress={() => Linking.openURL(whereToUseWalletUrl)}
            testID={testIdWithKey('WhereToUseLink')}
          />
        )}
        <ThemedText style={style.text}>{t('Scan.ScanOnlySpecial3')}</ThemedText>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ScanHelp
