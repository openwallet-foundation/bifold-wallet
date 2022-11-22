import type { StackScreenProps } from '@react-navigation/stack'

import { CredentialExchangeRecord } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import CommonDeleteModal from '../components/modals/CommonDeleteModal'
import { ToastType } from '../components/toast/BaseToast'
import { dateFormatOptions } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { getCurrentLanguage } from '../localization'
import { BifoldError } from '../types/error'
import { CredentialMetadata } from '../types/metadata'
import { CredentialStackParams, Screens } from '../types/navigators'
import { Field } from '../types/record'
import { getCredentialConnectionLabel } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type CredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.CredentialDetails>

const CredentialDetails: React.FC<CredentialDetailsProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialDetails route prams were not set properly')
  }

  const { credentialId } = route?.params

  const { agent } = useAgent()
  const { t } = useTranslation()
  const [state, dispatch] = useStore()
  const [isRevoked, setIsRevoked] = useState<boolean>(false)
  const [revocationDate, setRevocationDate] = useState<string>('')
  const [fields, setFields] = useState<Array<Field>>([])
  const [isRevokedMessageHidden, setIsRevokedMessageHidden] = useState<boolean>(false)
  const [isDeleteModalDisplayed, setIsDeleteModalDisplayed] = useState<boolean>(false)
  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)
  const { TextTheme, ColorPallet } = useTheme()
  const { OCABundle, record } = useConfiguration()

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
    if (isRevoked) {
      const date = new Date(credential.revocationNotification?.revocationDate)
      setRevocationDate(date.toLocaleDateString('en-CA', dateFormatOptions))
    }
    OCABundle.getCredentialPresentationFields(credential as CredentialExchangeRecord, getCurrentLanguage()).then(
      (fields) =>
        setFields(fields)
    )
  }, [credential])

  useEffect(() => {
    if (credential) {
      if (credential.revocationNotification) {
        credential.metadata.set(CredentialMetadata.customMetadata, { 'revoked_seen': true })
        const credService = agent?.credentials.getService('v1')
        credService?.update(credential)
      }
    }
  }, [isRevoked])

  const goBackToListCredentials = () => {
    navigation.pop()
    navigation.navigate(Screens.Credentials)
  }

  const handleRemovePressed = () => {
    setIsDeleteModalDisplayed(true)
  }

  const handleSubmitRemovePressed = async () => {
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

  const handleCancelRemovePressed = () => {
    setIsDeleteModalDisplayed(false)
  }

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
            onPress={() => handleRemovePressed()}
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
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      {record({
        header: header,
        footer: footer,
        fields: fields,
        hideFieldValues: true,
      })}
      <CommonDeleteModal
        visible={isDeleteModalDisplayed}
        onSubmit={() => handleSubmitRemovePressed()}
        onCancel={() => handleCancelRemovePressed()}
      ></CommonDeleteModal>
    </SafeAreaView>
  )
}

export default CredentialDetails
