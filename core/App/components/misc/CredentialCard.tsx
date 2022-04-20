import { CredentialRecord } from '@aries-framework/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'

import { dateFormatOptions } from '../../constants'
import { parsedSchema } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import { useThemeContext } from '../../utils/themeContext'

import AvatarView from './AvatarView'

interface CredentialCardProps {
  credential: CredentialRecord
  style?: ViewStyle
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, style = {} }) => {
  const { t } = useTranslation()
  const { ListItems } = useThemeContext()
  const styles = StyleSheet.create({
    container: {
      minHeight: 125,
      backgroundColor: ListItems.credentialBackground,
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
          <Text style={ListItems.credentialTitle} testID={testIdWithKey('CredentialName')}>
            {parsedSchema(credential).name}
          </Text>
          <Text style={ListItems.credentialDetails} testID={testIdWithKey('CredentialVersion')}>
            {t('CredentialDetails.Version')}: {parsedSchema(credential).version}
          </Text>
          <Text style={ListItems.credentialDetails} testID={testIdWithKey('CredentialIssued')}>
            {t('CredentialDetails.Issued')}: {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default CredentialCard
