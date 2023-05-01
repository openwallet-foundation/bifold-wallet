import { CredentialState, ProofState } from '@aries-framework/core'
import { useAgent, useCredentialById, useProofById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StatusBar, StyleSheet, Text, View, DeviceEventEmitter, FlatList } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { EventTypes } from '../constants'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { TabStacks, NotificationStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

type CommonDeclineProps = StackScreenProps<NotificationStackParams, Screens.CommonDecline>

const CommonDecline: React.FC<CommonDeclineProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CommonDecline route prams were not set properly')
  }

  const { declineType, itemId, deleteView, customClose } = route.params

  if (!itemId) {
    throw new Error('itemId cannot be undefined')
  }

  if (!declineType) {
    throw new Error('declineType cannot be undefined')
  }

  const { agent } = useAgent()
  const credential = useCredentialById(itemId)
  const proof = useProofById(itemId)
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [didDecline, setDidDecline] = useState<boolean>(false)
  const imageDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 250,
    width: 250,
  }
  const deleteImageDisplayOptions = {
    height: 100,
    width: 100,
  }
  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    image: {
      marginVertical: 66,
    },
    messageContainer: {
      marginTop: 25,
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 30,
    },
  })

  if (
    (declineType === DeclineType.ProofRequest && credential) ||
    (declineType === DeclineType.CredentialOffer && proof)
  ) {
    throw new Error('Usage type and artifact do not match')
  }

  const onDoneTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const confirmDeclineTouched = async () => {
    try {
      if (declineType === DeclineType.Custom && customClose) {
        customClose()
      }

      if (agent && credential) {
        await agent.credentials.declineOffer(credential.id)
        agent?.credentials.sendProblemReport({
          credentialRecordId: credential.id,
          message: t('CredentialOffer.Declined'),
        })
        return
      }

      if (agent && proof) {
        await agent.proofs.declineRequest(proof.id)
        agent?.proofs.sendProblemReport(proof.id, t('ProofRequest.Declined')) // currently, fails for connectionless case
        return
      }
    } catch (err: unknown) {
      const error = new BifoldError(
        declineType === DeclineType.ProofRequest ? t('Error.Title1028') : t('Error.Title1025'),
        declineType === DeclineType.ProofRequest ? t('Error.Message1028') : t('Error.Message1025'),
        (err as Error).message,
        1025
      )

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  useEffect(() => {
    if (credential) {
      navigation.setOptions({ title: t('CredentialOffer.DeclineTitle') })
    }

    if (credential && credential.state === CredentialState.Declined) {
      navigation.setOptions({ headerShown: false })
      setDidDecline(true)
    }
  }, [credential])

  useEffect(() => {
    if (proof) {
      navigation.setOptions({ title: t('ProofRequest.DeclineTitle') })
    }

    if (proof && proof.state === ProofState.Declined) {
      navigation.setOptions({ headerShown: false })
      setDidDecline(true)
    }
  }, [proof])

  const handleCancel = useCallback(() => {
    navigation.pop()
  }, [])

  const handleDelete = useCallback(() => {
    confirmDeclineTouched().then(() => {
      navigation.pop()
    })
  }, [])

  return (
    <>
      {deleteView ? (
        <SafeAreaView>
          <ScrollView style={[{ backgroundColor: ColorPallet.brand.modalPrimaryBackground }, styles.container]}>
            <Assets.svg.deleteNotification style={{ alignSelf: 'center' }} {...deleteImageDisplayOptions} />
            <Text style={[TextTheme.headingTwo, { marginTop: 20 }]}>Delete this offer?</Text>
            <Text style={[TextTheme.normal, { marginTop: 20 }]}>
              Deleting this offer will remove the notification from your list.
            </Text>
            <Text style={[TextTheme.normal, { marginTop: 20 }]}>
              Don't recognize the organization? Check your Contacts list. You only receive notifications from contacts
              you've initiated
            </Text>
          </ScrollView>
          <View style={{ marginTop: 'auto', margin: 20 }}>
            <View>
              <Button buttonType={ButtonType.Primary} onPress={handleDelete} title={'Delete'} />
            </View>
            <View style={{ marginTop: 20 }}>
              <Button buttonType={ButtonType.Secondary} onPress={handleCancel} title={'Cancel'} />
            </View>
          </View>
        </SafeAreaView>
      ) : (
        <SafeAreaView
          edges={['left', 'right', 'bottom'].concat(didDecline ? ['top'] : []) as Edge[]}
          style={{
            backgroundColor: didDecline
              ? ColorPallet.brand.modalPrimaryBackground
              : ColorPallet.brand.primaryBackground,
          }}
        >
          {didDecline && <StatusBar hidden={true} />}
          <>
            {!didDecline && (
              <>
                <FlatList
                  data={[credential]}
                  style={[styles.container]}
                  renderItem={() => {
                    return (
                      <View>
                        <InfoBox
                          notificationType={InfoBoxType.Warn}
                          title={
                            declineType === DeclineType.ProofRequest
                              ? t('ProofRequest.ConfirmDeclinedTitle')
                              : t('CredentialOffer.ConfirmDeclinedTitle')
                          }
                          description={
                            declineType === DeclineType.ProofRequest
                              ? t('ProofRequest.ConfirmDeclinedMessage')
                              : t('CredentialOffer.ConfirmDeclinedMessage')
                          }
                        />
                        {credential && (
                          <View style={{ marginTop: 20 }}>
                            <CredentialCard credential={credential} />
                          </View>
                        )}
                      </View>
                    )
                  }}
                />

                <View style={{ marginTop: 'auto', margin: 20 }}>
                  <View style={{ paddingTop: 10 }}>
                    <Button
                      title={
                        declineType === DeclineType.ProofRequest
                          ? t('ProofRequest.ConfirmDecline')
                          : t('CredentialOffer.ConfirmDecline')
                      }
                      accessibilityLabel={
                        declineType === DeclineType.ProofRequest
                          ? t('ProofRequest.ConfirmDecline')
                          : t('CredentialOffer.ConfirmDecline')
                      }
                      testID={testIdWithKey('ConfirmDeclineButton')}
                      onPress={confirmDeclineTouched}
                      buttonType={ButtonType.Primary}
                    />
                  </View>
                  <View style={[{ paddingTop: 10 }]}>
                    <Button
                      title={
                        declineType === DeclineType.ProofRequest
                          ? t('ProofRequest.AbortDecline')
                          : t('CredentialOffer.AbortDecline')
                      }
                      accessibilityLabel={
                        declineType === DeclineType.ProofRequest
                          ? t('ProofRequest.AbortDecline')
                          : t('CredentialOffer.AbortDecline')
                      }
                      testID={testIdWithKey('AbortDeclineButton')}
                      onPress={handleCancel}
                      buttonType={ButtonType.Secondary}
                    />
                  </View>
                </View>
              </>
            )}

            {didDecline && (
              <>
                <ScrollView style={[styles.container, { backgroundColor: ColorPallet.brand.modalPrimaryBackground }]}>
                  <View style={[styles.messageContainer]}>
                    <Text
                      style={[TextTheme.modalHeadingThree, styles.messageText]}
                      testID={testIdWithKey('RequestOrOfferDeclined')}
                    >
                      {declineType === DeclineType.ProofRequest
                        ? t('ProofRequest.ProofRequestDeclined')
                        : t('CredentialOffer.CredentialDeclined')}
                    </Text>
                    {declineType === DeclineType.ProofRequest ? (
                      <Assets.svg.proofRequestDeclined style={[styles.image]} {...imageDisplayOptions} />
                    ) : (
                      <Assets.svg.credentialDeclined style={[styles.image]} {...imageDisplayOptions} />
                    )}
                  </View>
                </ScrollView>

                <View style={{ marginTop: 'auto', margin: 20 }}>
                  <Button
                    title={t('Global.Done')}
                    accessibilityLabel={t('Global.Done')}
                    testID={testIdWithKey('Done')}
                    onPress={onDoneTouched}
                    buttonType={ButtonType.ModalPrimary}
                  />
                </View>
              </>
            )}
          </>
        </SafeAreaView>
      )}
    </>
  )
}

export default CommonDecline
