import { CredentialRecord } from '@aries-framework/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'

import { dateFormatOptions } from '../../constants'
import { parsedSchema } from '../../utils/helpers'
import { useThemeContext } from '../../utils/themeContext'
import Title from '../texts/Title'

import AvatarView from './AvatarView'

interface CredentialCardProps {
  credential: CredentialRecord
  style?: ViewStyle
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {} }) => {
  const { t } = useTranslation()
  const { TextTheme, ColorPallet } = useThemeContext()
  const styles = StyleSheet.create({
    container: {
      minHeight: 125,
      backgroundColor: ColorPallet.brand.secondaryBackground,
      justifyContent: 'center',
      borderRadius: 15,
      padding: 10,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    details: { flexShrink: 1 },
  })
  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <AvatarView name={parsedSchema(credential).name} />
        <View style={styles.details}>
          <Title>{parsedSchema(credential).name}</Title>
          <Text style={{ ...TextTheme.caption }}>
            {t('CredentialDetails.Version')}: {parsedSchema(credential).version}
          </Text>
          <Text style={{ ...TextTheme.caption }}>
            {t('CredentialDetails.Issued')}: {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default CredentialCard
