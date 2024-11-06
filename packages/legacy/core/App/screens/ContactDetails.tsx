import { CredentialState } from '@credo-ts/core'
import { useAgent, useConnectionById, useCredentialByState } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  DeviceEventEmitter,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import { ToastType } from '../components/toast/BaseToast'
import { EventTypes } from '../constants'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { ContactStackParams, Screens, TabStacks } from '../types/navigators'
import { ModalUsage } from '../types/remove'
import { formatTime, getConnectionName, useConnectionImageUrl } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'
import { toImageSource } from '../utils/credential'

type ContactDetailsProps = StackScreenProps<ContactStackParams, Screens.ContactDetails>

const CONTACT_IMG_PERCENTAGE = 0.12

const ContactDetails: React.FC<ContactDetailsProps> = ({ route }) => {
  if (!route?.params) {
    throw new Error('ContactDetails route params were not set properly')
  }
  const { connectionId } = route.params
  const { agent } = useAgent()
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<ContactStackParams>>()
  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState<boolean>(false)
  const [isCredentialsRemoveModalDisplayed, setIsCredentialsRemoveModalDisplayed] = useState<boolean>(false)
  const connection = useConnectionById(connectionId)
  const contactImageUrl = useConnectionImageUrl(connectionId)
  // FIXME: This should be exposed via a react hook that allows to filter credentials by connection id
  const connectionCredentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ].filter((credential) => credential.connectionId === connection?.id)
  const { ColorPallet, TextTheme, Assets } = useTheme()
  const [store] = useStore()
  const { width } = useWindowDimensions()
  const contactImageHeight = width * CONTACT_IMG_PERCENTAGE

  const [{ contactDetailsOptions }, ContactCredentialListItem] = useServices([
    TOKENS.CONFIG,
    TOKENS.COMPONENT_CONTACT_DETAILS_CRED_LIST_ITEM,
  ])

  const styles = StyleSheet.create({
    contentContainer: {
      padding: 20,
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    contactContainer: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      gap: 8,
    },
    contactImgContainer: {
      top: contactImageHeight * CONTACT_IMG_PERCENTAGE,
      alignSelf: 'flex-start',
      width: contactImageHeight,
      height: contactImageHeight,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    contactImg: {
      borderRadius: 8,
      width: contactImageHeight,
      height: contactImageHeight,
    },
    contactFirstLetterContainer: {
      flex: 1,
      maxWidth: contactImageHeight,
    },
    contactLabel: {
      ...TextTheme.headingThree,
      flex: 2,
      flexShrink: 1,
      alignSelf: 'flex-start',
    },
    actionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  })

  const callOnRemove = useCallback(() => {
    if (connectionCredentials?.length) {
      setIsCredentialsRemoveModalDisplayed(true)
    } else {
      setIsRemoveModalDisplayed(true)
    }
  }, [connectionCredentials])

  const callSubmitRemove = useCallback(async () => {
    try {
      if (!(agent && connection)) {
        return
      }

      await agent.connections.deleteById(connection.id)

      navigation.navigate(Screens.Contacts)

      // FIXME: This delay is a hack so that the toast doesn't appear until the modal is dismissed
      await new Promise((resolve) => setTimeout(resolve, 1000))

      Toast.show({
        type: ToastType.Success,
        text1: t('ContactDetails.ContactRemoved'),
      })
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1037'), t('Error.Message1037'), (err as Error)?.message ?? err, 1037)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }, [agent, connection, navigation, t])

  const callCancelRemove = useCallback(() => {
    setIsRemoveModalDisplayed(false)
  }, [])

  const callGoToCredentials = useCallback(() => {
    navigation.getParent()?.navigate(TabStacks.CredentialStack, { screen: Screens.Credentials })
  }, [navigation])

  const callCancelUnableToRemove = useCallback(() => {
    setIsCredentialsRemoveModalDisplayed(false)
  }, [])

  const callGoToRename = useCallback(() => {
    navigation.navigate(Screens.RenameContact, { connectionId })
  }, [navigation, connectionId])

  const contactLabel = useMemo(
    () => getConnectionName(connection, store.preferences.alternateContactNames),
    [connection, store.preferences.alternateContactNames]
  )

  const contactImage = () => {
    return (
      <>
        {contactImageUrl ? (
          <View style={styles.contactImgContainer}>
            <Image style={styles.contactImg} source={toImageSource(contactImageUrl)} />
          </View>
        ) : (
          <View style={styles.contactFirstLetterContainer}>
            <Text
              style={[
                TextTheme.bold,
                {
                  fontSize: contactImageHeight,
                  lineHeight: contactImageHeight,
                  alignSelf: 'center',
                  color: ColorPallet.brand.primary,
                },
              ]}
            >
              {contactLabel.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <View style={[styles.contentContainer, contactDetailsOptions?.enableCredentialList && { flex: 2 }]}>
        <View style={styles.contactContainer}>
          {contactImage()}
          <Text style={styles.contactLabel}>{contactLabel}</Text>
        </View>
        {contactDetailsOptions?.showConnectedTime && (
          <Text style={{ ...TextTheme.normal, marginTop: 20 }}>
            {t('ContactDetails.DateOfConnection', {
              date: connection?.createdAt ? formatTime(connection.createdAt, { includeHour: true }) : '',
            })}
          </Text>
        )}
        {contactDetailsOptions?.enableCredentialList && (
          <>
            <View style={{ borderTopColor: ColorPallet.grayscale.lightGrey, borderWidth: 1, marginTop: 20 }}></View>
            <Text style={{ ...TextTheme.headingFour, marginVertical: 16 }}>{t('ContactDetails.Credentials')}</Text>
            <FlatList
              ItemSeparatorComponent={() => <View style={{ height: 20 }}></View>}
              ListEmptyComponent={() => (
                <Text style={{ ...TextTheme.normal, color: ColorPallet.grayscale.lightGrey }}>
                  {t('ContactDetails.NoCredentials')}
                </Text>
              )}
              data={connectionCredentials}
              renderItem={({ item }) => (
                <ContactCredentialListItem
                  credential={item}
                  onPress={() => navigation.navigate(Screens.CredentialDetails, { credentialId: item.id })}
                />
              )}
              keyExtractor={(item) => item.id}
            />
          </>
        )}
      </View>
      <View>
        {contactDetailsOptions?.enableEditContactName && (
          <TouchableOpacity
            onPress={callGoToRename}
            accessibilityLabel={t('Screens.RenameContact')}
            accessibilityRole={'button'}
            testID={testIdWithKey('RenameContact')}
            style={[styles.contentContainer, styles.actionContainer, { marginTop: 10 }]}
          >
            <Assets.svg.iconEdit width={20} height={20} color={ColorPallet.brand.text} />
            <Text style={{ ...TextTheme.normal }}>{t('Screens.RenameContact')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={callOnRemove}
          accessibilityLabel={t('ContactDetails.RemoveContact')}
          accessibilityRole={'button'}
          testID={testIdWithKey('RemoveFromWallet')}
          style={[styles.contentContainer, styles.actionContainer, { marginTop: 10 }]}
        >
          <Assets.svg.iconDelete width={20} height={20} color={ColorPallet.semantic.error} />
          <Text style={{ ...TextTheme.normal, color: ColorPallet.semantic.error }}>
            {t('ContactDetails.RemoveContact')}
          </Text>
        </TouchableOpacity>
      </View>
      <CommonRemoveModal
        usage={ModalUsage.ContactRemove}
        visible={isRemoveModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
      />
      <CommonRemoveModal
        usage={ModalUsage.ContactRemoveWithCredentials}
        visible={isCredentialsRemoveModalDisplayed}
        onSubmit={callGoToCredentials}
        onCancel={callCancelUnableToRemove}
      />
    </SafeAreaView>
  )
}

export default ContactDetails
