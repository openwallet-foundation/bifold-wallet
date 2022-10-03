import { CredentialState, ProofState } from '@aries-framework/core'
import { useAgent, useCredentialById, useProofById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import ProofRequestDeclined from '../assets/img/proof-declined.svg'
import Button, { ButtonType } from '../components/buttons/Button'
import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
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

  const { declineType, itemId } = route.params

  if (!itemId) {
    throw new Error('itemId cannot be undefined')
  }

  if (!declineType) {
    throw new Error('declineType cannot be undefined')
  }

  const { agent } = useAgent()
  const credential = useCredentialById(itemId)
  const proof = useProofById(itemId)
  const [, dispatch] = useStore()
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const [didDecline, setDidDecline] = useState<boolean>(false)
  const imageDisplayOptions = {
    fill: ColorPallet.notification.infoText,
    height: 250,
    width: 250,
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
      if (agent && credential) {
        await agent.credentials.declineOffer(credential.id)
        return
      }

      if (agent && proof) {
        await agent.proofs.declineRequest(proof.id)
        return
      }
    } catch (err: unknown) {
      const error = new BifoldError(
        declineType === DeclineType.ProofRequest ? t('Error.Title1028') : t('Error.Title1025'),
        declineType === DeclineType.ProofRequest ? t('Error.Message1028') : t('Error.Message1025'),
        (err as Error).message,
        1025
      )

      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [{ error }],
      })
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

  return (
    <SafeAreaView edges={['left', 'right', 'bottom'].concat(didDecline ? ['top'] : []) as Edge[]}>
      {didDecline && <StatusBar hidden={true} />}
      <>
        {!didDecline && (
          <>
            <ScrollView style={[styles.container]}>
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
            </ScrollView>

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
                  onPress={() => {
                    navigation.pop()
                  }}
                  buttonType={ButtonType.Secondary}
                />
              </View>
            </View>
          </>
        )}

        {didDecline && (
          <>
            <ScrollView style={[styles.container]}>
              <View style={[styles.messageContainer]}>
                <Text
                  style={[TextTheme.headingThree, styles.messageText]}
                  testID={testIdWithKey('RequestOrOfferDeclined')}
                >
                  {declineType === DeclineType.ProofRequest
                    ? t('ProofRequest.ProofRequestDeclined')
                    : t('CredentialOffer.CredentialDeclined')}
                </Text>
                {declineType === DeclineType.ProofRequest ? (
                  <ProofRequestDeclined style={[styles.image]} {...imageDisplayOptions} />
                ) : (
                  <CredentialDeclined style={[styles.image]} {...imageDisplayOptions} />
                )}
              </View>
            </ScrollView>

            <View style={{ marginTop: 'auto', margin: 20 }}>
              <Button
                title={t('Global.Done')}
                accessibilityLabel={t('Global.Done')}
                testID={testIdWithKey('Done')}
                onPress={onDoneTouched}
                buttonType={ButtonType.Primary}
              />
            </View>
          </>
        )}
      </>
    </SafeAreaView>
  )
}

export default CommonDecline
