import React from 'react'
import { useTranslation } from 'react-i18next'
import { Linking, ScrollView, StyleSheet, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Link from '../components/texts/Link'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'

const ScanHelp: React.FC = () => {
  const { t } = useTranslation()
  const [{ whereToUseWalletUrl }] = useServices([TOKENS.CONFIG])

  const { TextTheme } = useTheme()
  const style = StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
      padding: 26,
    },
    text: {
      ...TextTheme.normal,
      marginTop: 15,
    },
  })

  return (
    <SafeAreaView style={style.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={style.scrollView}>
        <Text style={TextTheme.headingThree}>{t('Scan.WhatToScan')}</Text>
        <Text style={[style.text, { marginTop: 20 }]}>{t('Scan.ScanOnySpecial')}</Text>
        <Text style={style.text}>{t('Scan.ScanOnlySpecial2')}</Text>
        <Link
          linkText={t('Scan.WhereToUseLink')}
          style={style.text}
          onPress={() => whereToUseWalletUrl && Linking.openURL(whereToUseWalletUrl)}
          testID={testIdWithKey('WhereToUseLink')}
        />
        <Text style={style.text}>{t('Scan.ScanOnlySpecial3')}</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ScanHelp
