import { CredentialRecord } from '@aries-framework/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { dateFormatOptions } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { parsedSchema } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

import AvatarView from './AvatarView'

interface CredentialCardProps {
  credential: CredentialRecord
  revoked?: boolean
  style?: ViewStyle
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, revoked = false, style = {} }) => {
  const { t } = useTranslation()
  const { ListItems } = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...ListItems.credentialBackground,
      minHeight: 125,
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
    <View
      style={[
        styles.container,
        revoked && {
          ...ListItems.revoked,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <AvatarView
          name={parsedSchema(credential).name}
          style={revoked ? { borderColor: ListItems.revoked.borderColor } : {}}
        />
        <View style={styles.details}>
          <Text style={ListItems.credentialTitle} testID={testIdWithKey('CredentialName')}>
            {parsedSchema(credential).name}
          </Text>
          <Text style={ListItems.credentialDetails} testID={testIdWithKey('CredentialVersion')}>
            {t('CredentialDetails.Version')}: {parsedSchema(credential).version}
          </Text>

          {revoked ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                style={{ marginRight: 5 }}
                name="cancel"
                color={ListItems.revoked.backgroundColor}
                size={ListItems.credentialTitle.fontSize}
              ></Icon>
              <Text
                style={[ListItems.credentialDetails, { color: ListItems.revoked.backgroundColor, fontWeight: 'bold' }]}
                testID={testIdWithKey('CredentialRevoked')}
              >
                Revoked
              </Text>
            </View>
          ) : (
            <Text style={ListItems.credentialDetails} testID={testIdWithKey('CredentialIssued')}>
              {t('CredentialDetails.Issued')}: {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default CredentialCard
