import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'

interface RecordRemoveProps {
  onRemove?: GenericFn
}

const RecordRemove: React.FC<RecordRemoveProps> = ({ onRemove = () => null }) => {
  const { t } = useTranslation()
  const { TextTheme, ColorPallet } = useTheme()

  const callOnRemove = useCallback(() => onRemove(), [])

  const styles = StyleSheet.create({
    headerText: {
      ...TextTheme.normal,
    },
    footerText: {
      ...TextTheme.normal,
    },
    linkContainer: {
      minHeight: TextTheme.normal.fontSize,
      paddingVertical: 2,
    },
    link: {
      ...TextTheme.normal,
      color: ColorPallet.brand.link,
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
        accessible={true}
        accessibilityLabel={t('CredentialDetails.RemoveFromWallet')}
        testID={testIdWithKey('RemoveFromWallet')}
        activeOpacity={1}
        onPress={callOnRemove}
      >
        <Text
          style={[
            styles.footerText,
            styles.link,
            { color: ColorPallet.semantic.error, textDecorationLine: 'underline' },
          ]}
        >
          {t('CredentialDetails.RemoveFromWallet')}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default RecordRemove
