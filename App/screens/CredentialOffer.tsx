import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, FlatList, Alert, View } from 'react-native'
import Toast from 'react-native-toast-message'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import CredentialPending from '../assets/img/credential-pending.svg'
import CredentialSuccess from '../assets/img/credential-success.svg'
import { CredentialOfferTheme } from '../theme'
import { HomeStackParams, Screens, TabStackParams } from '../types/navigators'
import { parsedSchema } from '../utils/helpers'

import { Button, ModularView, Label } from 'components'
import { ButtonType } from 'components/buttons/Button'
import ActivityLogLink from 'components/misc/ActivityLogLink'
import NotificationModal from 'components/modals/NotificationModal'
import { ToastType } from 'components/toast/BaseToast'

interface CredentialOfferProps {
  navigation: StackNavigationProp<HomeStackParams> & BottomTabNavigationProp<TabStackParams>
  route: RouteProp<HomeStackParams, Screens.CredentialOffer>
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
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)

  if (!agent?.credentials) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('Global.SomethingWentWrong'),
    })

    navigation.goBack()
    return null
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

  const credential = getCredentialRecord(route?.params?.credentialId)

  if (!credential) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('CredentialOffer.CredentialNotFound'),
    })
    navigation.goBack()
    return null
  }

  useEffect(() => {
    if (credential.state === CredentialState.CredentialReceived || credential.state === CredentialState.Done) {
      pendingModalVisible && setPendingModalVisible(false)
      setSuccessModalVisible(true)
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

  // TODO: Reincorporate according to UI wireframes
  // const connection = connectionRecordFromId(credential.connectionId)

  const { name: schemaName, version: schemaVersion } = parsedSchema(credential)

  return (
    <View style={styles.container}>
      <NotificationModal
        title={t('CredentialOffer.CredentialOnTheWay')}
        doneTitle={t('Global.Cancel')}
        visible={pendingModalVisible}
        onDone={() => {
          setPendingModalVisible(false)
        }}
      >
        <CredentialPending style={{ marginVertical: 20 }}></CredentialPending>
      </NotificationModal>
      <NotificationModal
        title={t('CredentialOffer.CredentialAddedToYourWallet')}
        visible={successModalVisible}
        onDone={() => {
          setSuccessModalVisible(false)
          navigation.pop()
          navigation.navigate('CredentialsTab')
        }}
      >
        <CredentialSuccess style={{ marginVertical: 20 }}></CredentialSuccess>
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
        <CredentialDeclined style={{ marginVertical: 20 }}></CredentialDeclined>
        <ActivityLogLink></ActivityLogLink>
      </NotificationModal>
      <ModularView
        title={schemaName}
        subtitle={schemaVersion ? `${t('CredentialDetails.Version')}: ${schemaVersion}` : ''}
        content={
          <FlatList
            data={credential.credentialAttributes}
            keyExtractor={(attribute) => attribute.name}
            renderItem={({ item: attribute }) => <Label title={attribute.name} subtitle={attribute.value} />}
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
