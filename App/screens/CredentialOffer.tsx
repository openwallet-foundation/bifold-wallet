import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { ConnectionRecord, CredentialRecord, CredentialState } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialById } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, FlatList, Alert, View } from 'react-native'
import Toast from 'react-native-toast-message'

import { IndexedIndyCredentialMetadata, indyCredentialKey } from '../constants'
import { CredentialOfferTheme } from '../theme'
import { parseSchema } from '../utils/helpers'

import { Button, ModularView, Label } from 'components'
import { ButtonType } from 'components/buttons/Button'
import ActivityLogLink from 'components/misc/ActivityLogLink'
import NotificationModal from 'components/modals/NotificationModal'
import { ToastType } from 'components/toast/BaseToast'
import { HomeStackParams, TabStackParams } from 'types/navigators'

interface CredentialOfferProps {
  navigation: StackNavigationProp<HomeStackParams, 'Home'> &
    BottomTabNavigationProp<TabStackParams, 'HomeTab'> &
    BottomTabNavigationProp<TabStackParams, 'CredentialsTab'>
  route: RouteProp<HomeStackParams, 'Credential Offer'>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: CredentialOfferTheme.background,
  },
})

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [acceptedModalVisible, setAcceptedModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)

  if (!agent?.credentials) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('Global.SomethingWentWrong'),
    })

    navigation.goBack()

    return
  }

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
        text2: t('Global.SomethingWentWrong'),
      })

      navigation.goBack()
    }
  }

  const getConnectionRecordFromCredential = (connectionId?: string): ConnectionRecord | void => {
    if (connectionId) {
      return useConnectionById(connectionId)
    }
  }

  const credential = getCredentialRecord(route?.params?.credentialId)

  if (!credential) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })

    navigation.goBack()

    return
  }

  useEffect(() => {
    if (credential.state === CredentialState.CredentialReceived || credential.state === CredentialState.Done) {
      pendingModalVisible && setPendingModalVisible(false)
      setAcceptedModalVisible(true)
    }
  }, [credential])

  useEffect(() => {
    if (credential.state === CredentialState.Declined) {
      setDeclinedModalVisible(true)
    }
  }, [credential])

  const handleAcceptPress = async () => {
    setButtonsVisible(false)
    setPendingModalVisible(true)
    try {
      await agent.credentials.acceptOffer(credential.id)
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
    Alert.alert(t('CredentialOffer.RejectThisCredential?'), t('Global.ThisDecisionCannotBeChanged.'), [
      { text: t('Global.Cancel'), style: 'cancel' },
      {
        text: t('Global.Confirm'),
        style: 'destructive',
        onPress: async () => {
          setButtonsVisible(false)
          Toast.show({
            type: ToastType.Info,
            text1: t('Global.Info'),
            text2: t('CredentialOffer.RejectingCredential'),
          })

          try {
            await agent.credentials.declineOffer(credential.id)
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

  const connection = getConnectionRecordFromCredential(credential.connectionId)

  return (
    <View style={styles.container}>
      <NotificationModal
        title={t('CredentialOffer.CredentialOnTheWay')}
        doneTitle={t('Global.Cancel')}
        visible={pendingModalVisible}
        onDone={() => {
          setPendingModalVisible(false)
        }}
      ></NotificationModal>
      <NotificationModal
        title={t('CredentialOffer.CredentialAddedToYourWallet')}
        visible={acceptedModalVisible}
        onDone={() => {
          setAcceptedModalVisible(false)
          navigation.pop()
          navigation.navigate('CredentialsTab')
        }}
      >
        <ActivityLogLink></ActivityLogLink>
      </NotificationModal>
      <NotificationModal
        title={t('CredentialOffer.CredentialDeclined')}
        visible={declinedModalVisible}
        onDone={() => {
          setDeclinedModalVisible(false)
          navigation.pop()
          navigation.navigate('HomeTab')
        }}
      >
        <ActivityLogLink></ActivityLogLink>
      </NotificationModal>
      <ModularView
        title={parseSchema(credential.metadata.get<IndexedIndyCredentialMetadata>(indyCredentialKey)?.schemaId)}
        subtitle={connection?.alias || connection?.invitation?.label}
        content={
          <FlatList
            data={credential.credentialAttributes}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => <Label title={item.name} subtitle={item.value} />}
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
