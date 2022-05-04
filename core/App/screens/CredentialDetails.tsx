import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialRecord } from '@aries-framework/core'
import { useCredentialById } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import Record from '../components/record/Record'
import { ToastType } from '../components/toast/BaseToast'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { CredentialStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.CredentialDetails>

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [state] = useStore()
  const { revoked } = state.credential
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [isCredentialRevokedMessageHidden, setIsCredentialRevokedMessageHidden] = useState<boolean>(false)
  const styles = StyleSheet.create({
    headerText: {
      ...TextTheme.normal,
    },
    footerText: {
      ...TextTheme.normal,
      paddingTop: 16,
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
  const getCredentialRecord = (credentialId?: string): CredentialRecord | void => {
    try {
      if (!credentialId) {
        throw new Error(t('CredentialOffer.CredentialNotFound'))
      }

      return useCredentialById(credentialId)
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('CredentialOffer.CredentialNotFound'),
      })

      navigation.goBack()
    }
  }

  if (!route.params.credentialId) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()
    return null
  }

  const credential = getCredentialRecord(route.params.credentialId)

  if (!credential) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()
    return null
  }

  useEffect(() => {
    const isRevoked = revoked.has(credential.id) || revoked.has(credential.credentialId)
    setIsRevoked(isRevoked)
  }, [])

  return (
    <Record
      header={() => (
        <>
          {isRevoked && !isCredentialRevokedMessageHidden ? (
            <View style={{ marginHorizontal: -10, marginTop: 16 }}>
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={t('CredentialDetails.CredentialRevokedMessageTitle')}
                message={t('CredentialDetails.CredentialRevokedMessageBody')}
                onCallToActionLabel={t('Global.Dismiss')}
                onCallToActionPressed={() => setIsCredentialRevokedMessageHidden(true)}
              />
            </View>
          ) : null}
          <CredentialCard credential={credential} revoked={isRevoked} style={{ marginHorizontal: 15, marginTop: 16 }} />
        </>
      )}
      footer={() => (
        <View style={{ marginBottom: 30 }}>
          <TouchableOpacity
            accessible={true}
            accessibilityLabel={t('CredentialDetails.RemoveFromWallet')}
            testID={testIdWithKey('RemoveFromWallet')}
            activeOpacity={1}
          >
            <Text style={[styles.footerText, styles.link, { color: ColorPallet.semantic.error }]}>
              {t('CredentialDetails.RemoveFromWallet')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      attributes={credential.credentialAttributes}
      hideAttributeValues={true}
    />
  )
}

export default CredentialDetails
