import { useConnectionById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import ButtonLoading from '../components/animated/ButtonLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import LimitedTextInput from '../components/inputs/LimitedTextInput'
import { InfoBoxType } from '../components/misc/InfoBox'
import PopupModal from '../components/modals/PopupModal'
import KeyboardView from '../components/views/KeyboardView'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { ContactStackParams, Screens } from '../types/navigators'
import { getConnectionName } from '../utils/helpers'
import { testIdWithKey } from '../utils/testable'

type ErrorState = {
  visible: boolean
  title: string
  description: string
}

type RenameContactProps = StackScreenProps<ContactStackParams, Screens.RenameContact>

const RenameContact: React.FC<RenameContactProps> = ({ route }) => {
  const { connectionId } = route.params
  const connection = useConnectionById(connectionId)
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()
  const navigation = useNavigation()
  const [store, dispatch] = useStore()
  const [contactName, setContactName] = useState(getConnectionName(connection, store.preferences.alternateContactNames))
  const [loading, setLoading] = useState(false)
  const [errorState, setErrorState] = useState<ErrorState>({
    visible: false,
    title: '',
    description: '',
  })

  const styles = StyleSheet.create({
    screenContainer: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
      justifyContent: 'space-between',
    },

    contentContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
    },
    // below used as helpful label for view, no properties needed atp
    controlsContainer: {},

    buttonContainer: {
      width: '100%',
    },
  })

  const handleChangeText = (text: string) => {
    setContactName(text)
  }

  const handleCancelPressed = () => {
    navigation.goBack()
  }

  const handleContinuePressed = () => {
    if (contactName.length < 1) {
      setErrorState({
        title: t('RenameContact.EmptyNameTitle'),
        description: t('RenameContact.EmptyNameDescription'),
        visible: true,
      })
    } else if (contactName.length > 50) {
      setErrorState({
        title: t('RenameContact.CharCountTitle'),
        description: t('RenameContact.CharCountDescription'),
        visible: true,
      })
    } else {
      setLoading(true)
      dispatch({
        type: DispatchAction.UPDATE_ALTERNATE_CONTACT_NAMES,
        payload: [{ [connectionId]: contactName }],
      })
      setLoading(false)
      navigation.goBack()
    }
  }

  const handleDismissError = () => {
    setErrorState((prev) => ({ ...prev, visible: false }))
  }

  return (
    <KeyboardView>
      <View style={styles.screenContainer}>
        <View style={styles.contentContainer}>
          <Text style={[TextTheme.normal, { width: '100%', marginBottom: 16 }]}>
            {t('RenameContact.ThisContactName')}
          </Text>
          <View style={{ width: '100%' }}>
            <LimitedTextInput
              defaultValue={contactName}
              label={t('RenameContact.ContactName')}
              limit={50}
              handleChangeText={handleChangeText}
              accessibilityLabel={t('RenameContact.ContactName')}
              testID={testIdWithKey('NameInput')}
            />
          </View>
        </View>
        <View style={styles.controlsContainer}>
          <View style={styles.buttonContainer}>
            <Button
              title={t('Global.Save')}
              buttonType={ButtonType.Primary}
              testID={testIdWithKey('Save')}
              accessibilityLabel={t('Global.Save')}
              onPress={handleContinuePressed}
              disabled={loading}
            >
              {loading && <ButtonLoading />}
            </Button>
            <View style={{ marginTop: 15 }}>
              <Button
                title={t('Global.Cancel')}
                buttonType={ButtonType.Secondary}
                testID={testIdWithKey('Cancel')}
                accessibilityLabel={t('Global.Cancel')}
                onPress={handleCancelPressed}
              />
            </View>
          </View>
        </View>
      </View>
      {errorState.visible && (
        <PopupModal
          notificationType={InfoBoxType.Info}
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={handleDismissError}
          title={errorState.title}
          description={errorState.description}
        />
      )}
    </KeyboardView>
  )
}

export default RenameContact
