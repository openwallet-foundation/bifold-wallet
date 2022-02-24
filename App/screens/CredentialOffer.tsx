import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'

import { CredentialState } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialById } from '@aries-framework/react-hooks'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import startCase from 'lodash.startcase'
import { DateTimeFormatOptions } from 'luxon'
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
import { Screens, Stacks, HomeStackParams, TabStackParams } from '../types/navigators'
import { parsedSchema } from '../utils/helpers'

import { CredentialListItem, Title } from 'components'
import Button, { ButtonType } from 'components/buttons/Button'
import ActivityLogLink from 'components/misc/ActivityLogLink'
import AvatarView from 'components/misc/AvatarView'
import NotificationModal from 'components/modals/NotificationModal'

interface CredentialOfferProps {
  navigation: StackNavigationProp<HomeStackParams> & BottomTabNavigationProp<TabStackParams>
  route: RouteProp<HomeStackParams, Screens.CredentialOffer>
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: ColorPallet.brand.primaryBackground,
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
  label: {
    ...TextTheme.label,
  },
  textContainer: {
    minHeight: TextTheme.normal.fontSize,
    paddingVertical: 4,
  },
  text: {
    ...TextTheme.normal,
  },
  credentialValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
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
  const dateFormatOptions: DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
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
    <>
      <FlatList
        ListHeaderComponent={() => (
          <View style={styles.headerContainer}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>
                <Title>{invitation.label}</Title> {t('CredentialOffer.IsOfferingYouACredential')}
              </Text>
            </View>
            {/* TODO; Convert the CredentialListItem to Credential Component */}
            <View style={{ marginHorizontal: 15, marginBottom: 16 }}>
              <CredentialListItem credential={credential}></CredentialListItem>
            </View>
          </View>
        )}
        ListFooterComponent={() => (
          <View style={styles.footerContainer}>
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Accept')}
                buttonType={ButtonType.Primary}
                onPress={handleAcceptPress}
                disabled={!buttonsVisible}
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Decline')}
                buttonType={ButtonType.Secondary}
                onPress={handleDeclinePress}
                disabled={!buttonsVisible}
              />
            </View>
          </View>
        )}
        data={credential.credentialAttributes}
        keyExtractor={(attribute) => attribute.name}
        renderItem={({ item: attribute }) => {
          return (
            <View style={styles.listItem}>
              <Text style={styles.label}>{startCase(attribute.name)}</Text>
              <View style={styles.credentialValueContainer}>
                <View style={styles.textContainer}>
                  <Text style={styles.text}>{attribute.value}</Text>
                </View>
              </View>
              <View style={styles.listItemBorder}></View>
            </View>
          )
        }}
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
          navigation.navigate(Stacks.CredentialStack)
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
          navigation.navigate(Stacks.HomeStack)
        }}
      >
        <CredentialDeclined style={{ marginVertical: 20 }}></CredentialDeclined>
        <ActivityLogLink></ActivityLogLink>
      </NotificationModal>
    </>
  )
}

export default CredentialOffer
