import { FlatList, StyleSheet, View, Pressable } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { useTheme } from '../contexts/theme'
import { ThemedText } from '../components/texts/ThemedText'
import { testIdWithKey } from '../utils/testable'
import { useEffect, useState } from 'react'
import { LockoutReason, useAuth } from '../contexts/auth'
import { useAgent } from '@credo-ts/react-hooks'
import { MediationRecipientService } from '@credo-ts/core'
import DismissiblePopupModal from '../components/modals/DismissiblePopupModal'
import { useTranslation } from 'react-i18next'
import { StackScreenProps } from '@react-navigation/stack'
import { Screens, SettingStackParams } from '../types/navigators'
import { setMediationToDefault } from '../utils/mediatorhelpers'

type MediatorItem = {
  id: string
  label: string
  testID: string
}
type ConfigureMediatorProps = StackScreenProps<SettingStackParams, Screens.ConfigureMediator>

const ConfigureMediator = ({ route }: ConfigureMediatorProps) => {
  const [store, dispatch] = useStore()
  const { agent } = useAgent()
  const { ColorPalette, SettingsTheme } = useTheme()
  const { t } = useTranslation()
  const { lockOutUser } = useAuth()
  const supportedMediators = store.preferences.availableMediators
  const scannedMediatorUri = route.params?.scannedMediatorUri
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [pendingMediatorId, setPendingMediatorId] = useState<string | null>(null)

  useEffect(() => {
    if (scannedMediatorUri && !store.preferences.availableMediators.includes(scannedMediatorUri)) {
      dispatch({
        type: DispatchAction.ADD_AVAILABLE_MEDIATOR,
        payload: [scannedMediatorUri],
      })
    }
  }, [scannedMediatorUri, dispatch, store.preferences.availableMediators])
  const mediators: MediatorItem[] = supportedMediators.map((mediator) => ({
    id: mediator,
    label: String(mediator),
    testID: testIdWithKey(mediator),
  }))
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPalette.brand.primaryBackground,
      width: '100%',
    },
    section: {
      backgroundColor: SettingsTheme.groupBackground,
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemSeparator: {
      borderBottomWidth: 1,
      borderBottomColor: ColorPalette.brand.primaryBackground,
      marginHorizontal: 25,
    },
    checkboxContainer: {
      justifyContent: 'center',
    },
  })

  const confirmMediatorChange = async () => {
    if (!pendingMediatorId || !agent) return

    await agent.dependencyManager.resolve(MediationRecipientService).clearDefaultMediator(agent.context)
    agent.config.logger.info(`successfully cleared default mediator`)
    await setMediationToDefault(agent, pendingMediatorId)
    dispatch({
      type: DispatchAction.SET_SELECTED_MEDIATOR,
      payload: [pendingMediatorId],
    })
    lockOutUser(LockoutReason.Logout)
    setIsModalVisible(false)
  }

  const handleMediatorChange = async (mediatorId: string) => {
    if (mediatorId === store.preferences.selectedMediator) return
    setPendingMediatorId(mediatorId)
    setIsModalVisible(true)
  }

  const MediatorRow = ({
    label,
    id,
    testID,
    selected,
    onPress,
  }: {
    label: string
    id: string
    testID: string
    selected: boolean
    onPress: (id: string) => void
  }) => (
    <View style={[styles.section, styles.sectionRow]}>
      <ThemedText variant="title">{label}</ThemedText>
      <Pressable
        style={styles.checkboxContainer}
        accessibilityLabel={label}
        accessibilityRole="radio"
        testID={testIdWithKey(testID)}
      >
        <BouncyCheckbox
          disableText
          fillColor={ColorPalette.brand.secondaryBackground}
          unfillColor={ColorPalette.brand.secondaryBackground}
          size={36}
          innerIconStyle={{ borderColor: ColorPalette.brand.primary, borderWidth: 2 }}
          ImageComponent={() => <Icon name="circle" size={18} color={ColorPalette.brand.primary} />}
          onPress={() => onPress(id)}
          isChecked={selected}
          disableBuiltInState
        />
      </Pressable>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={mediators}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MediatorRow
            label={item.label.split('?')[0]}
            id={item.id}
            testID={item.testID}
            selected={store.preferences.selectedMediator === item.id}
            onPress={handleMediatorChange}
          />
        )}
      />
      {isModalVisible && (
        <DismissiblePopupModal
          title={t('Settings.ChangeMediator')}
          description={t('Settings.ChangeMediatorDescription')}
          onCallToActionLabel={t('Global.Confirm')}
          onCallToActionPressed={() => confirmMediatorChange()}
          onDismissPressed={() => setIsModalVisible(false)}
        />
      )}
    </SafeAreaView>
  )
}

export default ConfigureMediator
