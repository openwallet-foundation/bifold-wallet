import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialExchangeRecord } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import RecordRemove from '../components/record/RecordRemove'
import { ToastType } from '../components/toast/BaseToast'
import { dateFormatOptions } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { CredentialMetadata } from '../types/metadata'
import { CredentialStackParams, Screens } from '../types/navigators'
import { Field } from '../types/record'
import { RemoveType } from '../types/remove'
import { getCredentialConnectionLabel } from '../utils/helpers'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.CredentialDetails>

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialDetails route prams were not set properly')
  }

  const { credentialId } = route?.params
  const { agent } = useAgent()
  const { t, i18n } = useTranslation()
  const [, dispatch] = useStore()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [revocationDate, setRevocationDate] = useState<string>('')
  const [fields, setFields] = useState<Field[]>([])
  const [isRevokedMessageHidden] = useState<boolean>(false)
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)
  const { TextTheme, ColorPallet } = useTheme()
  const { OCABundle, record } = useConfiguration()

  useEffect(() => {
    if (!agent) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1033'),
              t('Error.Message1033'),
              t('CredentialDetails.CredentialNotFound'),
              1033
            ),
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    if (!credential) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1033'),
              t('Error.Message1033'),
              t('CredentialDetails.CredentialNotFound'),
              1033
            ),
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    if (!credential) {
      return
    }
    const indyCredentialFormat = credential.credentials.find((c) => c.credentialRecordType === 'indy')
    if (!indyCredentialFormat) {
      return
    }
    credential.revocationNotification == undefined ? setIsRevoked(false) : setIsRevoked(true)
    if (isRevoked && credential?.revocationNotification?.revocationDate) {
      const date = new Date(credential.revocationNotification.revocationDate)
      setRevocationDate(date.toLocaleDateString(i18n.language, dateFormatOptions))
    }
    OCABundle.getCredentialPresentationFields(credential as CredentialExchangeRecord, i18n.language).then((fields) =>
      setFields(fields)
    )
  }, [credential])

  useEffect(() => {
    if (credential?.revocationNotification) {
      credential.metadata.set(CredentialMetadata.customMetadata, { revoked_seen: true })
      const credService = agent?.credentials.getService('v1')
      credService?.update(credential)
    }
  }, [isRevoked])

  const goBackToListCredentials = () => {
    navigation.pop()
    navigation.navigate(Screens.Credentials)
  }

  const handleOnRemove = () => {
    setIsRemoveModalDisplayed(true)
  }

  const handleSubmitRemove = async () => {
    try {
      if (!(agent && credential)) {
        return
      }
      await agent.credentials.deleteById(credential.id)
      Toast.show({
        type: ToastType.Success,
        text1: t('CredentialDetails.CredentialRemoved'),
      })
      goBackToListCredentials()
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1032'), t('Error.Message1032'), (err as Error).message, 1025)

      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [{ error }],
      })
    }
  }

  const handleCancelRemove = () => {
    setIsRemoveModalDisplayed(false)
  }

  const callOnRemove = useCallback(() => handleOnRemove(), [])
  const callSubmitRemove = useCallback(() => handleSubmitRemove(), [])
  const callCancelRemove = useCallback(() => handleCancelRemove(), [])

  const header = () => {
    return (
      <>
        {isRevoked && !isRevokedMessageHidden ? (
          <View style={{ marginHorizontal: 15, marginTop: 16 }}>
            {credential && (
              <InfoBox
                notificationType={InfoBoxType.Warn}
                title={t('CredentialDetails.CredentialRevokedMessageTitle') + ' ' + revocationDate}
                description={
                  credential?.revocationNotification?.comment
                    ? credential.revocationNotification.comment
                    : t('CredentialDetails.CredentialRevokedMessageBody')
                }
              />
            )}
          </View>
        ) : null}
        {credential && <CredentialCard credential={credential} style={{ marginHorizontal: 15, marginTop: 16 }} />}
      </>
    )
  }

  const footer = () => {
    return (
      <View style={{ marginBottom: 30 }}>
        {credentialConnectionLabel ? (
          <View
            style={{
              backgroundColor: ColorPallet.brand.secondaryBackground,
              marginTop: 16,
              paddingHorizontal: 25,
              paddingVertical: 16,
            }}
          >
            <View>
              <Text>
                <Text style={[TextTheme.title]}>{t('CredentialDetails.IssuedBy')}</Text>{' '}
                <Text style={[TextTheme.normal]}>{credentialConnectionLabel}</Text>
              </Text>
            </View>
          </View>
        ) : null}
        <RecordRemove onRemove={callOnRemove} />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {record({
        header,
        footer,
        fields,
        hideFieldValues: true,
      })}
      <CommonRemoveModal
        removeType={RemoveType.Credential}
        visible={isRemoveModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
      />
    </SafeAreaView>
  )
}

export default CredentialDetails
