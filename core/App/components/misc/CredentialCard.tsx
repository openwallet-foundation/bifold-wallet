import { CredentialRecord } from '@aries-framework/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { dateFormatOptions } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { parsedSchema } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'

import AvatarView from './AvatarView'

interface CredentialCardProps {
  credential: CredentialRecord
  revoked?: boolean
  style?: ViewStyle
  onPress?: GenericFn
}

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  revoked = false,
  style = {},
  onPress = undefined,
}) => {
  const { t } = useTranslation()
  const { ColorPallet, ListItems } = useTheme()
  const styles = StyleSheet.create({
    container: {
      ...ListItems.credentialBackground,
      minHeight: 125,
      justifyContent: 'center',
      borderRadius: 15,
      padding: 10,
      backgroundColor: 'red',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    details: { flexShrink: 1 },
  })
  return (
    <TouchableOpacity
      disabled={typeof onPress === 'undefined' ? true : false}
      onPress={onPress}
      style={[styles.container, revoked && {}, style]}
      testID={testIdWithKey('ShowCredentialDetails')}
    >
      <View style={styles.row} testID={testIdWithKey('CredentialCard')}>
        <AvatarView
          name={parsedSchema(credential).name}
          style={
            revoked
              ? { borderColor: ListItems.revoked.borderColor, backgroundColor: ColorPallet.brand.primaryBackground }
              : {}
          }
        />
        <View style={styles.details}>
          <Text style={ListItems.credentialTitle} testID={testIdWithKey('CredentialName')}>
            {parsedSchema(credential).name}
          </Text>
          <Text style={ListItems.credentialDetails} testID={testIdWithKey('CredentialVersion')}>
            {t('CredentialDetails.Version')}: {parsedSchema(credential).version}
          </Text>

          {revoked ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
              <Icon
                style={{ marginRight: 5 }}
                name="cancel"
                color={ColorPallet.semantic.error}
                size={ListItems.credentialTitle.fontSize}
              ></Icon>
              <Text
                style={[ListItems.credentialDetails, { color: ColorPallet.semantic.error, fontWeight: 'bold' }]}
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
    </TouchableOpacity>
  )
}

export default CredentialCard
