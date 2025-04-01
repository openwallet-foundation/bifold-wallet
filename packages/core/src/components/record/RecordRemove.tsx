import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import { ThemedText } from '../texts/ThemedText'

interface RecordRemoveProps {
  onRemove?: GenericFn
}

const RecordRemove: React.FC<RecordRemoveProps> = ({ onRemove = () => null }) => {
  const { t } = useTranslation()
  const { TextTheme, ColorPallet, Assets } = useTheme()

  const styles = StyleSheet.create({
    headerText: {
      ...TextTheme.normal,
    },
    footerText: {
      color: ColorPallet.brand.link,
    },
    linkContainer: {
      minHeight: TextTheme.normal.fontSize,
      paddingVertical: 2,
    },
    credentialRemoveContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  })

  return (
    <View
      style={{
        backgroundColor: ColorPallet.brand.secondaryBackground,
        marginTop: 16,
        paddingHorizontal: 25,
        paddingVertical: 16,
      }}
    >
      <TouchableOpacity
        style={styles.credentialRemoveContainer}
        accessible={true}
        accessibilityLabel={t('CredentialDetails.RemoveFromWallet')}
        accessibilityRole={'button'}
        testID={testIdWithKey('RemoveFromWallet')}
        activeOpacity={1}
        onPress={onRemove}
      >
        <Assets.svg.iconDelete width={20} height={20} color={ColorPallet.semantic.error} />
        <ThemedText style={[styles.footerText, { color: ColorPallet.semantic.error }]}>
          {t('CredentialDetails.RemoveFromWallet')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  )
}

export default RecordRemove
