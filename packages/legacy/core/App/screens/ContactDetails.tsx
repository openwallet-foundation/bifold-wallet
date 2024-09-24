import { CredentialState } from '@credo-ts/core'
import { useAgent, useConnectionById, useCredentialByState } from '@credo-ts/react-hooks'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
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
import { formatTime, getConnectionName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ContactDetailsProps = StackScreenProps<ContactStackParams, Screens.ContactDetails>

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
  // FIXME: This should be exposed via a react hook that allows to filter credentials by connection id
  const connectionCredentials = [
    ...useCredentialByState(CredentialState.CredentialReceived),
    ...useCredentialByState(CredentialState.Done),
  ].filter((credential) => credential.connectionId === connection?.id)
  const { ColorPallet, TextTheme } = useTheme()
  const [store] = useStore()

  const styles = StyleSheet.create({
    contentContainer: {
      padding: 20,
      backgroundColor: ColorPallet.brand.secondaryBackground,
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

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <View style={styles.contentContainer}>
        <Text style={{ ...TextTheme.headingThree }}>{contactLabel}</Text>
        <Text style={{ ...TextTheme.normal, marginTop: 20 }}>
          {t('ContactDetails.DateOfConnection', {
            date: connection?.createdAt ? formatTime(connection.createdAt, { includeHour: true }) : '',
          })}
        </Text>
      </View>
      <TouchableOpacity
        onPress={callGoToRename}
        accessibilityLabel={t('Screens.RenameContact')}
        accessibilityRole={'button'}
        testID={testIdWithKey('RenameContact')}
        style={[styles.contentContainer, { marginTop: 10 }]}
      >
        <Text style={{ ...TextTheme.normal }}>{t('Screens.RenameContact')}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={callOnRemove}
        accessibilityLabel={t('ContactDetails.RemoveContact')}
        accessibilityRole={'button'}
        testID={testIdWithKey('RemoveFromWallet')}
        style={[styles.contentContainer, { marginTop: 10 }]}
      >
        <Text style={{ ...TextTheme.normal, color: ColorPallet.semantic.error }}>
          {t('ContactDetails.RemoveContact')}
        </Text>
      </TouchableOpacity>
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
