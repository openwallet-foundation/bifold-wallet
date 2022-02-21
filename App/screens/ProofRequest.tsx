import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { ProofRecord, ProofState, RequestedAttribute, RetrievedCredentials } from '@aries-framework/core'
import { useAgent } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import startCase from 'lodash.startcase'
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, Alert, View, StyleSheet, Text, TouchableOpacity } from 'react-native'
import Toast from 'react-native-toast-message'
import Icon from 'react-native-vector-icons/MaterialIcons'

import ProofDeclined from '../assets/img/proof-declined.svg'
import ProofPending from '../assets/img/proof-pending.svg'
import ProofSuccess from '../assets/img/proof-success.svg'
import { ColorPallet, TextTheme } from '../theme'
import { HomeStackParams, Screens, Stacks, TabStackParams } from '../types/navigators'
import {
  connectionRecordFromId,
  firstMatchingCredentialAttributeValue,
  getConnectionName,
  proofRecordFromId,
} from '../utils/helpers'

import Button, { ButtonType } from 'components/buttons/Button'
import ActivityLogLink from 'components/misc/ActivityLogLink'
import NotificationModal from 'components/modals/NotificationModal'
import Title from 'components/texts/Title'
import { ToastType } from 'components/toast/BaseToast'

interface ProofRequestProps {
  navigation: StackNavigationProp<HomeStackParams> & BottomTabNavigationProp<TabStackParams>
  route: RouteProp<HomeStackParams, Screens.ProofRequest>
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
    paddingHorizontal: 25,
    paddingVertical: 16,
  },
  headerText: {
    ...TextTheme.normal,
    flexShrink: 1,
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
  rowTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    ...TextTheme.label,
  },
  attributeValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  avatar: {
    width: TextTheme.headingTwo.fontSize * 2,
    height: TextTheme.headingTwo.fontSize * 2,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: TextTheme.headingTwo.fontSize,
    borderColor: TextTheme.headingTwo.color,
  },
})

const ProofRequest: React.FC<ProofRequestProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)

  const [retrievedCredentials, setRetrievedCredentials] = useState<RetrievedCredentials>()
  const [retrievedCredentialAttributes, setRetrievedCredentialAttributes] = useState<[string, RequestedAttribute[]][]>(
    []
  )

  if (!agent?.proofs) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('Global.SomethingWentWrong'),
    })
    navigation.goBack()
    return null
  }

  const anyUnavailableCredentialAttributes = (attributes: [string, RequestedAttribute[]][] = []): boolean =>
    attributes.some(([, values]) => !values?.length)

  const getProofRecord = (proofId?: string): ProofRecord | void => {
    try {
      const proof = proofRecordFromId(proofId)
      if (!proof) {
        throw new Error(t('ProofRequest.ProofNotFound'))
      }
      return proof
    } catch (e: unknown) {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    }
  }

  const { proofId } = route?.params
  const proof = getProofRecord(proofId)

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
    const updateRetrievedCredentials = async (proof: ProofRecord) => {
      const creds = await agent.proofs.getRequestedCredentialsForProofRequest(proof.id)
      if (!creds) {
        throw new Error(t('ProofRequest.RequestedCredentialsCouldNotBeFound'))
      }
      setRetrievedCredentials(creds)
      setRetrievedCredentialAttributes(Object.entries(creds?.requestedAttributes || {}))
    }

    updateRetrievedCredentials(proof).catch((e: unknown) => {
      Toast.show({
        type: ToastType.Error,
        text1: t('Global.Failure'),
        text2: (e as Error)?.message || t('Global.Failure'),
      })
      navigation.goBack()
    })
  }, [])

  useEffect(() => {
    if (proof.state === ProofState.Done) {
      pendingModalVisible && setPendingModalVisible(false)
      setSuccessModalVisible(true)
    }
  }, [proof])

  useEffect(() => {
    if (proof.state === ProofState.Declined) {
      setDeclinedModalVisible(true)
    }
  }, [proof])

  const handleAcceptPress = async () => {
    setButtonsVisible(false)
    setPendingModalVisible(true)
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
      setPendingModalVisible(false)
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
            Toast.hide()
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
    <View>
      <NotificationModal
        title={t('ProofRequest.SendingTheInformationSecurely')}
        doneTitle={t('Global.Cancel')}
        visible={pendingModalVisible}
        onDone={() => {
          setPendingModalVisible(false)
        }}
      >
        <ProofPending style={{ marginVertical: 20 }}></ProofPending>
      </NotificationModal>
      <NotificationModal
        title={t('ProofRequest.InformationSentSuccessfully')}
        visible={successModalVisible}
        onDone={() => {
          setSuccessModalVisible(false)
          navigation.pop()
          navigation.navigate(Stacks.HomeStack)
        }}
      >
        <ProofSuccess style={{ marginVertical: 20 }}></ProofSuccess>
        <ActivityLogLink></ActivityLogLink>
      </NotificationModal>
      <NotificationModal
        title={t('ProofRequest.ProofRejected')}
        visible={declinedModalVisible}
        onDone={() => {
          setDeclinedModalVisible(false)
          navigation.pop()
          navigation.navigate(Stacks.HomeStack)
        }}
      >
        <ProofDeclined style={{ marginVertical: 20 }}></ProofDeclined>
        <ActivityLogLink></ActivityLogLink>
      </NotificationModal>
      <FlatList
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
              {anyUnavailableCredentialAttributes(retrievedCredentialAttributes) ? (
                <View style={[styles.rowTextContainer]}>
                  <Icon
                    style={{ marginLeft: -2, marginRight: 10 }}
                    name="highlight-off"
                    color={TextTheme.headingOne.color}
                    size={TextTheme.headingOne.fontSize}
                  ></Icon>
                  <Text style={styles.headerText}>
                    <Title>{getConnectionName(connection) || t('ProofRequest.AContact')}</Title>{' '}
                    {t('ProofRequest.IsRequestingSomethingYouDontHaveAvailable')}:
                  </Text>
                </View>
              ) : (
                <Text style={styles.headerText}>
                  <Title>{getConnectionName(connection) || t('ProofRequest.AContact')}</Title>{' '}
                  {t('ProofRequest.IsRequestingYouToShare')}:
                </Text>
              )}
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
            <Text style={styles.label}>{`${startCase(name)}:`}</Text>
            <View style={styles.attributeValueContainer}>
              <View style={styles.textContainer}>
                {values.length ? (
                  <View>
                    <Text style={styles.text}>{firstMatchingCredentialAttributeValue(name, values)}</Text>
                  </View>
                ) : (
                  <View style={styles.rowTextContainer}>
                    <Icon
                      style={{ paddingTop: 2, paddingHorizontal: 2 }}
                      name="close"
                      color={ColorPallet.semantic.error}
                      size={TextTheme.normal.fontSize}
                    ></Icon>
                    <Text style={[TextTheme.normal, { color: ColorPallet.semantic.error }]}>
                      {t('ProofRequest.NotAvailableInYourWallet')}
                    </Text>
                  </View>
                )}
              </View>
              {values.length ? (
                <TouchableOpacity
                  activeOpacity={1}
                  onPress={() =>
                    navigation.navigate(Screens.ProofRequestAttributeDetails, {
                      proofId,
                      attributeName: name,
                      attributeCredentials: values,
                    })
                  }
                  style={styles.linkContainer}
                >
                  <Text style={styles.link}>{t('ProofRequest.Details')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <View style={styles.listItemBorder}></View>
          </View>
        )}
      />
    </View>
  )
}

export default ProofRequest
