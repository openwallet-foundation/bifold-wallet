import { CredentialState } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialByState } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, Modal, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Toast from 'react-native-toast-message'

import Button, { ButtonType } from '../components/buttons/Button'
import CommonRemoveModal from '../components/modals/CommonRemoveModal'
import RecordRemove from '../components/record/RecordRemove'
import { ToastType } from '../components/toast/BaseToast'
import FauxNavigationBar from '../components/views/FauxNavigationBar'
import { EventTypes } from '../constants'
import { useConfiguration } from '../contexts/configuration'
import { useTheme } from '../contexts/theme'
import { BifoldError } from '../types/error'
import { ContactStackParams, Screens, TabStacks } from '../types/navigators'
import { Attribute } from '../types/record'
import { RemoveType } from '../types/remove'
import { formatTime } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ContactDetailsProps = StackScreenProps<ContactStackParams, Screens.ContactDetails>

const ContactDetails: React.FC<ContactDetailsProps> = ({ route }) => {
  const { connectionId } = route?.params
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
  const { record } = useConfiguration()
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      padding: 20,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginHorizontal: 20,
      marginBottom: Platform.OS === 'ios' ? 108 : 20,
    },
  })

  const handleOnRemove = () => {
    setIsRemoveModalDisplayed(true)
  }

  const handleSubmitRemove = async () => {
    try {
      if (!(agent && connection)) {
        return
      }

      if (connectionCredentials?.length) {
        setIsCredentialsRemoveModalDisplayed(true)
      } else {
        await agent.connections.deleteById(connection.id)
        Toast.show({
          type: ToastType.Success,
          text1: t('ContactDetails.ContactRemoved'),
        })
        navigation.navigate(Screens.Contacts)
      }
    } catch (err: unknown) {
      const error = new BifoldError(t('Error.Title1037'), t('Error.Message1037'), (err as Error).message, 1025)

      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleCancelRemove = () => {
    setIsRemoveModalDisplayed(false)
  }

  const handleGoToCredentials = () => {
    navigation.getParent()?.navigate(TabStacks.CredentialStack, { screen: Screens.Credentials })
  }

  const handleCancelUnableRemove = () => {
    setIsCredentialsRemoveModalDisplayed(false)
  }

  const callOnRemove = useCallback(() => handleOnRemove(), [])
  const callSubmitRemove = useCallback(() => handleSubmitRemove(), [])
  const callCancelRemove = useCallback(() => handleCancelRemove(), [])
  const callGoToCredentials = useCallback(() => handleGoToCredentials(), [])
  const callCancelUnableToRemove = useCallback(() => handleCancelUnableRemove(), [])

  const CredentialsRemoveModal = ({ visible = false }) => {
    return (
      <Modal visible={visible} animationType={'slide'}>
        <FauxNavigationBar title={t('CredentialDetails.RemoveFromWallet')} />
        <SafeAreaView
          edges={['left', 'right', 'bottom']}
          style={{ backgroundColor: ColorPallet.brand.modalPrimaryBackground }}
        >
          <ScrollView style={[styles.container]}>
            <View>
              <View style={[{ marginBottom: 25 }]}>
                <Text style={[TextTheme.modalTitle]}>{t('ContactDetails.UnableToRemoveTitle')}</Text>
              </View>
              <View>
                <Text style={[TextTheme.modalNormal]}>{t('ContactDetails.UnableToRemoveCaption')}</Text>
              </View>
            </View>
          </ScrollView>
          <View style={[styles.controlsContainer]}>
            <View style={[{ paddingTop: 10 }]}>
              <Button
                title={t('ContactDetails.GoToCredentials')}
                accessibilityLabel={t('ContactDetails.GoToCredentials')}
                testID={testIdWithKey('GoToCredentialsButton')}
                onPress={callGoToCredentials}
                buttonType={ButtonType.ModalPrimary}
              />
            </View>
            <View style={[{ paddingTop: 10 }]}>
              <Button
                title={t('Global.Cancel')}
                accessibilityLabel={t('Global.Cancel')}
                testID={testIdWithKey('AbortGoToCredentialsButton')}
                onPress={callCancelUnableToRemove}
                buttonType={ButtonType.ModalSecondary}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      {record({
        fields: [
          {
            name: connection?.alias || connection?.theirLabel,
            value: t('ContactDetails.DateOfConnection', {
              date: connection?.createdAt ? formatTime(connection.createdAt) : '',
            }),
          },
        ] as Attribute[],
        footer: () => <RecordRemove onRemove={callOnRemove} />,
      })}
      <CommonRemoveModal
        removeType={RemoveType.Contact}
        visible={isRemoveModalDisplayed}
        onSubmit={callSubmitRemove}
        onCancel={callCancelRemove}
      />
      <CredentialsRemoveModal visible={isCredentialsRemoveModalDisplayed} />
    </SafeAreaView>
  )
}

export default ContactDetails
