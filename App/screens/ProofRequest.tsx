import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { ProofRecord, ProofState, RequestedAttribute, RetrievedCredentials } from '@aries-framework/core'
import { useAgent, useProofById } from '@aries-framework/react-hooks'
import startCase from 'lodash.startcase'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Alert, View, StyleSheet, Text } from 'react-native'
import Toast from 'react-native-toast-message'

import { ColorPallet, TextTheme } from '../theme'

import { Button } from 'components'
import { ButtonType } from 'components/buttons/Button'
import { ToastType } from 'components/toast/BaseToast'
import { HomeStackParams } from 'types/navigators'

interface CredentialOfferProps {
  navigation: StackNavigationProp<HomeStackParams, 'Proof Request'>
  route: RouteProp<HomeStackParams, 'Proof Request'>
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  headerLogoContainer: {
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  headerTextContainer: {
    flexDirection: 'row',
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  headerText: {
    ...TextTheme.normal,
  },
  footerContainer: {
    backgroundColor: ColorPallet.brand.secondaryBackground,
    height: '100%',
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  footerButton: {
    paddingTop: 10,
  },
  listItem: {
    paddingHorizontal: 25,
    paddingTop: 16,
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  listItemBorder: {
    borderBottomColor: ColorPallet.brand.primaryBackground,
    borderBottomWidth: 2,
    paddingTop: 12,
  },
  linkContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 2,
  },
  link: {
    ...TextTheme.normal,
    color: ColorPallet.brand.link,
  },
  textContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 4,
  },
  text: {
    ...TextTheme.normal,
  },
  label: {
    ...TextTheme.label,
  },
  attributeValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
})

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)

  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>()
  const [retrievedCredentialAttributes, setRetrievedCredentialAttributes] = useState<[string, RequestedAttribute[]][]>()

  if (!agent?.proofs) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('Global.SomethingWentWrong'),
    })
    navigation.goBack()
    return null
  }

  const firstMatchingCredentialAttributeValue = (attributeName: string, attributes: RequestedAttribute[]): string => {
    if (!attributes.length) {
      return ''
    }
    const firstMatchingCredential = attributes[0].credentialInfo
    const match = Object.entries(firstMatchingCredential.attributes).find(
      ([n]) => startCase(n) === startCase(attributeName)
    )
    return match?.length ? match[1] : ''
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
      setRetrievedCredentialAttributes(Object.entries(creds?.requestedAttributes || {}))
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

  return (
    <FlatList
      ListHeaderComponent={() => (
        <View style={styles.headerContainer}>
          <View style={styles.headerLogoContainer}>
            <Text style={styles.headerText}>{'<Placeholder logo here>'}</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>
              {'<PLaceholder issuer here>'} is requesting you to share the following:
            </Text>
          </View>
        </View>
      )}
      ListFooterComponent={() => (
        <View style={styles.footerContainer}>
          <View style={styles.footerButton}>
            <Button
              title={t('Global.Share')}
              buttonType={ButtonType.Primary}
              onPress={handleAcceptPress}
              disabled={!buttonsVisible}
            />
          </View>
          <View style={styles.footerButton}>
            <Button
              title={t('Global.Decline')}
              buttonType={ButtonType.Secondary}
              onPress={handleRejectPress}
              disabled={!buttonsVisible}
            />
          </View>
        </View>
      )}
      data={retrievedCredentialAttributes}
      keyExtractor={([name]) => name}
      renderItem={({ item: [name, values] }) => (
        <View style={styles.listItem}>
          <Text style={styles.label}>{`${name}:`}</Text>
          <View style={styles.attributeValueContainer}>
            <View style={styles.textContainer}>
              <Text style={styles.text}>{firstMatchingCredentialAttributeValue(name, values)}</Text>
            </View>
          </View>
          <View style={styles.listItemBorder}></View>
        </View>
      )}
    />
  )
}

export default CredentialOffer
