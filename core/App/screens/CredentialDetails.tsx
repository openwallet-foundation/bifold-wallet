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
import Record from '../components/record/Record'
import { ToastType } from '../components/toast/BaseToast'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { CredentialStackParams, Screens } from '../types/navigators'
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
  const [isRevokedMessageHidden, setIsRevokedMessageHidden] = useState<boolean>(false)
  const [isDeleteModalDisplayed, setIsDeleteModalDisplayed] = useState<boolean>(false)
  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)
  const { TextTheme, ColorPallet } = useTheme()

  const { revoked, revokedMessageDismissed } = state.credential

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
    const isRevoked = revoked.has(indyCredentialFormat.credentialRecordId)
    setIsRevoked(isRevoked)
    const isRevokedMessageDismissed = revokedMessageDismissed.has(indyCredentialFormat.credentialRecordId)
    setIsRevokedMessageHidden(isRevokedMessageDismissed)
  }, [credential])

  const goBackToListCredentials = () => {
    navigation.pop()
    navigation.navigate(Screens.Credentials)
  }

  const handleDismissRevokedMessagePressed = (credential: CredentialExchangeRecord) => {
    dispatch({ type: DispatchAction.CREDENTIAL_REVOKED_MESSAGE_DISMISSED, payload: [credential] })
    setIsRevokedMessageHidden(true)
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

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      <Record
        header={() => (
          <>
            {isRevoked && !isRevokedMessageHidden ? (
              <View style={{ marginHorizontal: 15, marginTop: 16 }}>
                {credential && (
                  <InfoBox
                    notificationType={InfoBoxType.Warn}
                    title={t('CredentialDetails.CredentialRevokedMessageTitle')}
                    description={t('CredentialDetails.CredentialRevokedMessageBody')}
                    onCallToActionLabel={t('Global.Dismiss')}
                    onCallToActionPressed={() => handleDismissRevokedMessagePressed(credential)}
                  />
                )}
              </View>
            ) : null}
            {credential && <CredentialCard credential={credential} style={{ marginHorizontal: 15, marginTop: 16 }} />}
          </>
        )}
        footer={() => (
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
        )}
        fields={credential?.credentialAttributes}
        hideFieldValues={true}
      />
      <CommonDeleteModal
        visible={isDeleteModalDisplayed}
        onSubmit={() => handleSubmitRemovePressed()}
        onCancel={() => handleCancelRemovePressed()}
      ></CommonDeleteModal>
    </SafeAreaView>
  )
}

export default CredentialDetails
