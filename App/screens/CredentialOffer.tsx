import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { CredentialRecord, CredentialState } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import startCase from 'lodash.startcase'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, FlatList, Alert, View, Text } from 'react-native'
import Toast from 'react-native-toast-message'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import CredentialPending from '../assets/img/credential-pending.svg'
import CredentialSuccess from '../assets/img/credential-success.svg'
import { CredentialOfferTheme } from '../theme'
import { parsedSchema } from '../utils/helpers'
import { borderRadius, ColorPallet, CredentialOfferTheme, TextTheme } from '../theme'
import { connectionRecordFromId, parsedSchema } from '../utils/helpers'

import { Button, ModularView, Label } from 'components'
import { ButtonType } from 'components/buttons/Button'
import ActivityLogLink from 'components/misc/ActivityLogLink'
import AvatarView from 'components/misc/AvatarView'
import NotificationModal from 'components/modals/NotificationModal'
import { ToastType } from 'components/toast/BaseToast'
import { HomeStackParams, TabStackParams } from 'types/navigators'

interface CredentialOfferProps {
  navigation: StackNavigationProp<HomeStackParams> & BottomTabNavigationProp<TabStackParams>
  route: RouteProp<HomeStackParams, 'Credential Offer'>
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: ColorPallet.brand.primaryBackground,
  },
  listItem: {
    paddingHorizontal: 25,
    paddingTop: 16,
    backgroundColor: ColorPallet.brand.secondaryBackground,
  },
  label: {
    ...TextTheme.label,
  },
  textContainer: {
    justifyContent: 'space-between',
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 15,
    height: 90,
  },
  text: {
    ...TextTheme.normal,
  },
})

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)
  // TODO:(jl) Cleanup
  const { credentialId } = route!.params!
  const credential = useCredentialById(credentialId)
  const { name: schemaName } = parsedSchema(credential)
  const { invitation } = connectionRecordFromId(credential.connectionId)
  //
  const dateFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }

  if (!agent?.credentials) {
    Toast.show({
      type: ToastType.Error,
      text1: t('Global.Failure'),
      text2: t('Global.SomethingWentWrong'),
    })

    navigation.goBack()
    return null
  }

  // const getCredentialRecord = (credentialId?: string): CredentialRecord | void => {
  //   try {
  //     if (!credentialId) {
  //       throw new Error(t('CredentialOffer.CredentialNotFound'))
  //     }
  //     return useCredentialById(credentialId)
  //   } catch (e: unknown) {
  //     Toast.show({
  //       type: ToastType.Error,
  //       text1: t('Global.Failure'),
  //       text2: t('Global.SomethingWentWrong'),
  //     })

  //     navigation.goBack()
  //   }
  // }

  // if (!credential) {
  //   Toast.show({
  //     type: ToastType.Error,
  //     text1: t('Global.Failure'),
  //     text2: t('CredentialOffer.CredentialNotFound'),
  //   })
  //   navigation.goBack()
  //   return null
  // }

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

  return (
    <View style={styles.container}>
      <FlatList
        data={credential.credentialAttributes}
        keyExtractor={(attribute) => attribute.name}
        renderItem={({ item, index }) => {
          return (
            <View style={[styles.listItem, index === 0 ? { borderTopLeftRadius: 20, borderTopRightRadius: 20 } : null]}>
              <View style={[styles.textContainer]}>
                <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}>{startCase(item.name)}</Text>
                <Text style={styles.text}>{item.value}</Text>
              </View>
              <View style={[{ borderBottomWidth: 1, borderBottomColor: ColorPallet.grayscale.lightGrey }]} />
            </View>
          )
        }}
        ListHeaderComponent={() => (
          <View style={[{ marginBottom: 20, marginHorizontal: 25 }]}>
            <View style={[{ marginVertical: 20 }]}>
              <Text style={[TextTheme.headingThree, { textAlign: 'center' }]}>{invitation.label}</Text>
              <Text style={[TextTheme.normal, { textAlign: 'center' }]}>is offering you a credential</Text>
            </View>
            <View
              style={[
                {
                  flexDirection: 'row',
                  backgroundColor: ColorPallet.brand.secondaryBackground,
                  borderRadius: 10,
                },
              ]}
            >
              <AvatarView name={invitation.label} />
              <View style={[{ flexDirection: 'column', justifyContent: 'center' }]}>
                <Text style={[TextTheme.normal, { fontWeight: 'bold' }]}>{schemaName}</Text>
                <Text style={[TextTheme.normal, { marginTop: 10 }]}>{`Issued: ${credential.createdAt.toLocaleDateString(
                  'en-CA',
                  dateFormatOptions
                )}`}</Text>
                {/* <Text style={[TextTheme.normal]}>{'Issued: Jan 21, 2022'}</Text> */}
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={[{ backgroundColor: ColorPallet.brand.secondaryBackground, paddingTop: 25 }]}>
            <View style={[{ marginBottom: 20, marginHorizontal: 25 }]}>
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
        )}
      />
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
    </View>
  )
}

export default CredentialOffer
