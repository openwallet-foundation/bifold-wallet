import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { ConnectionRecord, CredentialState } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialById } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import startCase from 'lodash.startcase'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, FlatList, Alert, View, Text } from 'react-native'

import CredentialDeclined from '../assets/img/credential-declined.svg'
import CredentialPending from '../assets/img/credential-pending.svg'
import CredentialSuccess from '../assets/img/credential-success.svg'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { ColorPallet, TextTheme } from '../theme'
import { BifoldError } from '../types/error'
import { parsedSchema } from '../utils/helpers'

import { Button } from 'components'
import { ButtonType } from 'components/buttons/Button'
import ActivityLogLink from 'components/misc/ActivityLogLink'
import AvatarView from 'components/misc/AvatarView'
import NotificationModal from 'components/modals/NotificationModal'
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
  if (!route?.params) {
    throw new Error('CredentialOffer route prams were not set properly')
  }

  const { credentialId } = route.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useContext(Context)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [pendingModalVisible, setPendingModalVisible] = useState(false)
  const [successModalVisible, setSuccessModalVisible] = useState(false)
  const [declinedModalVisible, setDeclinedModalVisible] = useState(false)
  const dateFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
  const credential = useCredentialById(credentialId)

  if (!credential) {
    throw new Error('Unable to fetch credential from AFJ')
  }

  if (!agent) {
    throw new Error('Unable to fetch agent from AFJ')
  }

  const { name: schemaName } = parsedSchema(credential)
  // @ts-ignore next-line
  const { invitation } = useConnectionById(credential.connectionId)

  if (!invitation) {
    throw new Error('Unable to invitation from AFJ')
  }

  useEffect(() => {
    if (credential.state === CredentialState.Declined) {
      setDeclinedModalVisible(true)
    }
  }, [credential])

  useEffect(() => {
    if (credential.state === CredentialState.CredentialReceived || credential.state === CredentialState.Done) {
      pendingModalVisible && setPendingModalVisible(false)
      setSuccessModalVisible(true)
    }
  }, [credential])

  const handleAcceptPress = async () => {
    setButtonsVisible(false)
    setPendingModalVisible(true)

    try {
      await agent.credentials.acceptOffer(credential.id)
    } catch (e: unknown) {
      setButtonsVisible(true)
      setPendingModalVisible(false)

      const error = new BifoldError(
        'Unable to accept offer',
        'There was a problem while accepting the credential offer.',
        1024
      )

      dispatch({
        type: DispatchAction.SetError,
        payload: [{ error }],
      })
    }
  }

  const handleDeclinePress = async () => {
    Alert.alert(t('CredentialOffer.RejectThisCredential?'), t('Global.ThisDecisionCannotBeChanged.'), [
      { text: t('Global.Cancel'), style: 'cancel' },
      {
        text: t('Global.Confirm'),
        style: 'destructive',
        onPress: async () => {
          setButtonsVisible(false)

          try {
            await agent.credentials.declineOffer(credential.id)
          } catch (e: unknown) {
            const error = new BifoldError(
              'Unable to reject offer',
              'There was a problem while rejecting the credential offer.',
              1024
            )
            dispatch({
              type: DispatchAction.SetError,
              payload: [{ error }],
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
                onPress={handleDeclinePress}
                disabled={!buttonsVisible}
              />
            </View>
          </View>
        )}
      />
      <NotificationModal
        testID={t('CredentialOffer.CredentialOnTheWay')}
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
        testID={t('CredentialOffer.CredentialAddedToYourWallet')}
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
        testID={t('CredentialOffer.CredentialDeclined')}
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
