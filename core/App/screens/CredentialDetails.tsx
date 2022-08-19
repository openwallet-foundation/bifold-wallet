import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialExchangeRecord as CredentialRecord } from '@aries-framework/core'
import { useCredentialById, useAgent } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import Record from '../components/record/Record'
import { ToastType } from '../components/toast/BaseToast'
import { dateFormatOptions } from '../constants'
import { CredentialStackParams, Screens } from '../types/navigators'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.CredentialDetails>

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { agent } = useAgent()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [revocationDate, setRevocationDate] = useState<string>('')
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
    if (credential.revocationNotification) {
      setIsRevoked(true)
      const date = new Date(credential.revocationNotification?.revocationDate)
      setRevocationDate(date.toLocaleDateString('en-CA', dateFormatOptions))
    }
  }, [])

  useEffect(() => {
    if (credential.revocationNotification) {
      credential.metadata.set('revoked_seen', true)
      const credService = agent?.credentials.getService('v1')
      credService?.update(credential)
    }
  }, [isRevoked])

  return (
    <Record
      header={() => (
        <>
          <CredentialCard credential={credential} revoked={isRevoked} style={{ marginHorizontal: 15, marginTop: 16 }} />
          {isRevoked && (
            <View style={{ marginHorizontal: 15, marginTop: 16 }}>
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={t('CredentialDetails.CredentialRevokedMessageTitle') + ' ' + revocationDate}
                description={
                  credential?.revocationNotification?.comment
                    ? credential.revocationNotification.comment
                    : t('CredentialDetails.CredentialRevokedMessageBody')
                }
              />
            </View>
          )}
        </>
      )}
      footer={() => (
        <View style={{ marginBottom: 30 }}>
          {/* <TouchableOpacity
            accessible={true}
            accessibilityLabel={t('CredentialDetails.RemoveFromWallet')}
            testID={testIdWithKey('RemoveFromWallet')}
            activeOpacity={1}
          >
            <Text style={[styles.footerText, styles.link, { color: ColorPallet.semantic.error }]}>
              {t('CredentialDetails.RemoveFromWallet')}
            </Text>
          </TouchableOpacity> */}
        </View>
      )}
      fields={credential.credentialAttributes}
      hideFieldValues={true}
    />
  )
}

export default CredentialDetails
