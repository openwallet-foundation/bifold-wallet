import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { ProofRecord, ProofState, RequestedAttribute, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Alert, View, StyleSheet } from 'react-native'
import Toast from 'react-native-toast-message'

import { ProofRequestTheme } from '../theme'
import { connectionRecordFromId, parseSchema } from '../utils/helpers'

import { Button, ModularView, Label } from 'components'
import { ButtonType } from 'components/buttons/Button'
import { ToastType } from 'components/toast/BaseToast'
import { HomeStackParams } from 'types/navigators'

interface CredentialOfferProps {
  navigation: StackNavigationProp<HomeStackParams, 'Proof Request'>
  route: RouteProp<HomeStackParams, 'Proof Request'>
}

interface CredentialDisplay {
  name: string
  value: string
  credentialDefinitionId: string
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: ProofRequestTheme.background,
  },
})

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)

  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>()
  const [retrievedCredentialsDisplay, setRetrievedCredentialsDisplay] = useState<CredentialDisplay[]>()

  if (!agent?.proofs) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('Global.SomethingWentWrong'),
    })
    navigation.goBack()
    return null
  }

  const transformAttributes = (attributes: Record<string, RequestedAttribute[]>): CredentialDisplay[] => {
    const transformedAttributes = []
    for (const attribute in attributes) {
      const { name: schemaName, version: schemaVersion } = parseSchema(attributes[attribute][0].credentialInfo.schemaId)
      transformedAttributes.push({
        name: attribute,
        value: attributes[attribute][0].credentialInfo.attributes[attribute],
        credentialDefinitionId: `${schemaName + (schemaVersion ? ` V${schemaVersion}` : '')}`,
      })
    }
    return transformedAttributes
  }

  const getProofRecord = (proofId?: string): ProofRecord | void => {
    try {
      if (!proofId) {
        throw new Error(t('ProofRequest.ProofNotFound'))
      }
      return useProofById(proofId)
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    }
  }

  const getRetrievedCredentials = async (proof: ProofRecord) => {
    try {
      const creds = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
      if (!creds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      setRetrievedCredentials(creds)
      setRetrievedCredentialsDisplay(transformAttributes(creds.requestedAttributes))
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Global.Failure'),
      })
    }
  }

  const proof = getProofRecord(route?.params?.proofId)

  if (!proof) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('ProofRequest.ProofNotFound'),
    })
    navigation.goBack()
    return null
  }

  useEffect(() => {
    try {
      getRetrievedCredentials(proof)
    } catch (e: unknown) {
      navigation.goBack()
    }
  }, [])

  useEffect(() => {
    if (proof.state === ProofState.Done) {
      Toast.show({
        type: ToastType.Success,
        text1: t('Global.Success'),
        text2: t('ProofRequest.ProofAccepted'),
      })
      navigation.goBack()
    }
  }, [proof])

  useEffect(() => {
    if (proof.state === ProofState.Declined) {
      Toast.show({
        type: ToastType.Info,
        text1: t('Global.Info'),
        text2: t('ProofRequest.ProofRejected'),
      })
      navigation.goBack()
    }
  }, [proof])

  const handleAcceptPress = async () => {
    setButtonsVisible(false)
    Toast.show({
      type: ToastType.Info,
      text1: t('Global.Info'),
      text2: t('ProofRequest.AcceptingProof'),
    })
    try {
      const automaticRequestedCreds =
        retrievedCredentials && agent.proofs.autoSelectCredentialsForProofRequest(retrievedCredentials)
      if (!automaticRequestedCreds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      await agent.proofs.acceptRequest(proof.id, automaticRequestedCreds)
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Global.Failure'),
      })
      setButtonsVisible(true)
    }
  }

  const handleRejectPress = async () => {
    Alert.alert(t('ProofRequest.RejectThisProof?'), t('Global.ThisDecisionCannotBeChanged.'), [
      { text: t('Global.Cancel'), style: 'cancel' },
      {
        text: t('Global.Confirm'),
        style: 'destructive',
        onPress: async () => {
          Toast.show({
            type: ToastType.Info,
            text1: t('Global.Info'),
            text2: t('ProofRequest.RejectingProof'),
          })
          try {
            await agent.proofs.declineRequest(proof.id)
          } catch (e: unknown) {
            Toast.show({
              type: ToastType.Error,
              text1: t('Global.Failure'),
              text2: (e as Error)?.message || t('Global.Failure'),
            })
          }
        },
      },
    ])
  }

  const connection = connectionRecordFromId(proof.connectionId)

  return (
    <View style={styles.container}>
      <ModularView
        title={proof.requestMessage?.indyProofRequest?.name || connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={retrievedCredentialsDisplay}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <Label title={item.name} subtitle={item.value} label={item.credentialDefinitionId} />
            )}
          />
        }
      />
      <View style={[{ marginHorizontal: 20 }]}>
        <View style={[{ paddingBottom: 10 }]}>
          <Button
            title={t('Global.Accept')}
            buttonType={ButtonType.Primary}
            onPress={handleAcceptPress}
            disabled={!buttonsVisible}
          />
        </View>
        <Button
          title={t('Global.Decline')}
          buttonType={ButtonType.Secondary}
          onPress={handleRejectPress}
          disabled={!buttonsVisible}
        />
      </View>
    </View>
  )
}

export default CredentialOffer
