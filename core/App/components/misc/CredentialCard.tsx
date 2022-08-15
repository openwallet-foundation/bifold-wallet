import { CredentialExchangeRecord } from '@aries-framework/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, ViewStyle } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
// import Icon from 'react-native-vector-icons/MaterialIcons'

import { dateFormatOptions } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { getCredentialConnectionLabel, hashCode, hashToRGBA, parsedCredDefName } from '../../utils/helpers'
import { luminanceForHexColour } from '../../utils/luminance'
import { testIdWithKey } from '../../utils/testable'

interface CredentialCardProps {
  credential: CredentialExchangeRecord
  revoked?: boolean
  style?: ViewStyle
  onPress?: GenericFn
}

const height = 160
const padding = 10

const CredentialCard: React.FC<CredentialCardProps> = ({
  credential,
  revoked = false,
  style = {},
  onPress = undefined,
}) => {
  const { t } = useTranslation()
  const { ListItems, ColorPallet, TextTheme } = useTheme()

  const credentialLabel = parsedCredDefName(credential)
  const credentialBackgroundColor = hashToRGBA(hashCode(credentialLabel))
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)

  const credentialTextColor = (hex?: string) => {
    const midpoint = 255 / 2
    if ((luminanceForHexColour(hex ?? '') ?? 0) >= midpoint) {
      return ColorPallet.grayscale.darkGrey
    }
    return ColorPallet.grayscale.white
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: credentialBackgroundColor,
      minHeight: height,
      paddingHorizontal: 16,
      paddingVertical: padding,
      borderRadius: 15,
    },
    headerContainer: {
      flexDirection: 'row',
      flexGrow: 1,
      flexShrink: 1,
    },
    footerContainer: {
      justifyContent: 'flex-end',
      flexGrow: 1,
      flexShrink: 1,
    },
  })

  const renderCredentialCardHeader = () => {
    return (
      <View testID={testIdWithKey('CredentialCardHeader')} style={styles.headerContainer}>
        <Text
          style={[
            TextTheme.normal,
            {
              fontWeight: 'bold',
              color: credentialTextColor(credentialBackgroundColor),
              flexGrow: 1,
              flexShrink: 1,
            },
          ]}
          testID={testIdWithKey('CredentialIssuer')}
          maxFontSizeMultiplier={1}
        >
          {credentialConnectionLabel}
        </Text>
        <Text
          style={[
            TextTheme.normal,
            {
              fontWeight: 'bold',
              color: credentialTextColor(credentialBackgroundColor),
              flexGrow: 1,
              flexShrink: 1,
              textAlign: 'right',
              paddingLeft: 16,
            },
          ]}
          testID={testIdWithKey('CredentialName')}
          maxFontSizeMultiplier={1}
        >
          {credentialLabel}
        </Text>
      </View>
    )
  }

  const renderCredentialCardFooter = (revoked = false) => {
    return (
      <View testID={testIdWithKey('CredentialCardFooter')} style={styles.footerContainer}>
        {revoked ? null : (
          // TODO: Fix revocation styling
          // <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
          //   <Icon
          //     style={{ marginRight: 5 }}
          //     name="cancel"
          //     color={ColorPallet.semantic.error}
          //     size={ListItems.credentialTitle.fontSize}
          //   ></Icon>
          //   <Text
          //     style={[ListItems.credentialDetails, { color: ColorPallet.semantic.error, fontWeight: 'bold' }]}
          //     testID={testIdWithKey('CredentialRevoked')}
          //   >
          //     Revoked
          //   </Text>
          // </View>
          <Text
            style={[TextTheme.normal, { color: credentialTextColor(credentialBackgroundColor) }]}
            testID={testIdWithKey('CredentialIssued')}
            maxFontSizeMultiplier={1}
          >
            {t('CredentialDetails.Issued')}: {credential.createdAt.toLocaleDateString('en-CA', dateFormatOptions)}
          </Text>
        )}
      </View>
    )
  }

  return (
    <TouchableOpacity
      disabled={typeof onPress === 'undefined' ? true : false}
      onPress={onPress}
      style={[styles.container, revoked && { backgroundColor: ListItems.revoked.backgroundColor }, style]}
      testID={testIdWithKey('ShowCredentialDetails')}
    >
      {renderCredentialCardHeader()}
      {/* {renderCredentialCardBody()} */}
      {renderCredentialCardFooter(revoked)}
    </TouchableOpacity>
  )
}

export default CredentialCard
