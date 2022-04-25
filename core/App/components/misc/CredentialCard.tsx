import { CredentialRecord } from '@aries-framework/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { dateFormatOptions } from '../../constants'
import { parsedSchema } from '../../utils/helpers'
import { testIdWithKey } from '../../utils/testable'
import { useThemeContext } from '../../utils/themeContext'

import AvatarView from './AvatarView'

interface CredentialCardProps {
  credential: CredentialRecord
  revoked?: boolean
  style?: ViewStyle
}

const CredentialCard: React.FC<CredentialCardProps> = ({ credential, revoked = false, style = {} }) => {
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
    <View
      style={[
        styles.container,
        revoked && {
          backgroundColor: ColorPallet.notification.error,
          borderColor: ColorPallet.notification.errorBorder,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        <AvatarView
          name={parsedSchema(credential).name}
          style={revoked ? { borderColor: ColorPallet.notification.errorBorder } : {}}
        />
        <View style={styles.details}>
          <Text style={[TextTheme.headingFour]} testID={testIdWithKey('CredentialName')}>
            {parsedSchema(credential).name}
          </Text>
          <Text style={[TextTheme.caption]} testID={testIdWithKey('CredentialVersion')}>
            {t('CredentialDetails.Version')}: {parsedSchema(credential).version}
          </Text>

          {revoked ? (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Icon
                style={{ marginRight: 5 }}
                name="cancel"
                color={ColorPallet.semantic.error}
                size={TextTheme.headingFour.fontSize}
              ></Icon>
              <Text
                style={[TextTheme.caption, { color: ColorPallet.semantic.error, fontWeight: 'bold' }]}
                testID={testIdWithKey('CredentialRevoked')}
              >
                Revoked
              </Text>
            </View>
          ) : (
            <Text style={[TextTheme.caption]} testID={testIdWithKey('CredentialIssued')}>
              {t('CredentialDetails.Issued')}: {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

export default CredentialCard
