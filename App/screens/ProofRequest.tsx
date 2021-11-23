import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { HomeStackParams } from 'navigators/HomeStack'

import {
  ConnectionRecord,
  ProofRecord,
  ProofState,
  RequestedAttribute,
  RetrievedCredentials,
} from '@aries-framework/core'
import { useAgent, useConnectionById, useProofById } from '@aries-framework/react-hooks'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Alert, View, StyleSheet } from 'react-native'
import Toast from 'react-native-toast-message'

import { backgroundColor } from '../globalStyles'
import { parseSchema } from '../helpers'

import { Button, ModularView, Label } from 'components'

interface Props {
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
    backgroundColor,
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
  },
})

const CredentialOffer: React.FC<Props> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)

  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials | null>(null)
  const [retrievedCredentialsDisplay, setRetrievedCredentialsDisplay] = useState<CredentialDisplay[] | null>(null)

  const transformAttributes = (attributes: Record<string, RequestedAttribute[]>): CredentialDisplay[] => {
    const transformedAttributes = []
    for (const attribute in attributes) {
      transformedAttributes.push({
        name: attribute,
        value: attributes[attribute][0].credentialInfo.attributes[attribute],
        credentialDefinitionId: parseSchema(attributes[attribute][0].credentialInfo.schemaId),
      })
    }
    return transformedAttributes
  }

  const getProofRecord = (proofId?: string): ProofRecord | void => {
    try {
      if (!proofId) {
        throw new Error(t('Proof not found'))
      }
      return useProofById(proofId)
    } catch (e: unknown) {
      // console.error(e)
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Failure'),
      })
      navigation.goBack()
    }
  }

  const getConnectionRecordFromProof = (connectionId?: string): ConnectionRecord | void => {
    if (connectionId) {
      return useConnectionById(connectionId)
    }
  }

  const getRetrievedCredentials = async (proof: ProofRecord) => {
    try {
      const creds = await agent?.proofs?.getRequestedCredentialsForProofRequest(proof?.id)
      if (!creds) {
        throw new Error(t('Requested credentials could not be found'))
      }
      setRetrievedCredentials(creds)
      setRetrievedCredentialsDisplay(transformAttributes(creds?.requestedAttributes))
    } catch (e: unknown) {
      // console.error(e)
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Failure'),
      })
    }
  }

  const proof = getProofRecord(route?.params?.proofId)
  const connection = getConnectionRecordFromProof(proof?.connectionId)

  useEffect(() => {
    try {
      if (!proof?.requestMessage?.indyProofRequest) {
        throw new Error('Proof not found')
      }
      getRetrievedCredentials(proof)
    } catch (e) {
      // console.error(e)
      navigation.goBack()
    }
  }, [])

  useEffect(() => {
    if (proof?.state === ProofState.Done) {
      Toast.show({
        type: 'success',
        text1: t('Proof Accepted'),
      })
      navigation.goBack()
    }
  }, [proof])

  useEffect(() => {
    if (proof?.state === ProofState.Declined) {
      Toast.show({
        type: 'info',
        text1: t('Proof Rejected'),
      })
      navigation.goBack()
    }
  }, [proof])

  const handleAcceptPress = async () => {
    if (!(proof && retrievedCredentials)) {
      return
    }
    setButtonsVisible(false)
    Toast.show({
      type: 'info',
      text1: t('Accepting Proof'),
    })
    try {
      const automaticRequestedCreds = agent?.proofs?.autoSelectCredentialsForProofRequest(retrievedCredentials)
      if (!automaticRequestedCreds) {
        throw new Error(t('Requested credentials could not be found'))
      }
      await agent?.proofs.acceptRequest(proof?.id, automaticRequestedCreds)
    } catch (e: unknown) {
      // console.error(e)
      Toast.show({
        type: 'error',
        text1: (e as Error)?.message || t('Failure'),
      })
      setButtonsVisible(true)
    }
  }

  const handleRejectPress = async () => {
    if (!proof) {
      return
    }
    Alert.alert(t('Reject this Proof?'), t('This decision cannot be changed.'), [
      { text: t('Cancel'), style: 'cancel' },
      {
        text: t('Confirm'),
        style: 'destructive',
        onPress: async () => {
          Toast.show({
            type: 'info',
            text1: t('Rejecting Proof'),
          })
          try {
            await agent?.proofs?.declineRequest(proof?.id)
          } catch (e: unknown) {
            // console.error(e)
            Toast.show({
              type: 'error',
              text1: t('Failure'),
            })
          }
        },
      },
    ])
  }

  return (
    <View style={styles.container}>
      <ModularView
        title={proof?.requestMessage?.indyProofRequest?.name || connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={retrievedCredentialsDisplay}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <Label title={item.name} subtitle={item.value} label={item.credentialDefinitionId} />
            )}
          />
        }
      />
      <Button title={t('Accept')} onPress={handleAcceptPress} disabled={!buttonsVisible} />
      <Button title={t('Reject')} negative onPress={handleRejectPress} disabled={!buttonsVisible} />
    </View>
  )
}

export default CredentialOffer
