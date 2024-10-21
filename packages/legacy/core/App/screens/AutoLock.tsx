import { Pressable, StyleSheet, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ColorPallet, SettingsTheme, TextTheme } from '../theme'
import { AutoLockTime } from '../components/misc/InactivityWrapper'
import { testIdWithKey } from '../utils/testable'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import React from 'react'
import { FlatList } from 'react-native-gesture-handler'

type AutoLockListItem = {
  title: string
  selected: boolean
  value: (typeof AutoLockTime)[keyof typeof AutoLockTime]
  testID: string
  onPress: (val: (typeof AutoLockTime)[keyof typeof AutoLockTime]) => void
}

const AutoLock: React.FC = () => {
  const [store, dispatch] = useStore()
  const currentLockoutTime = store.preferences.autoLockTime ?? AutoLockTime.FiveMinutes
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
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
      borderBottomColor: ColorPallet.brand.primaryBackground,
      marginHorizontal: 25,
    },
    checkboxContainer: {
      justifyContent: 'center',
    },
  })

  const handleTimeoutChange = (time: (typeof AutoLockTime)[keyof typeof AutoLockTime]) => {
    dispatch({
      type: DispatchAction.AUTO_LOCK_TIME,
      payload: [time],
    })
  }

  const LockoutRow: React.FC<AutoLockListItem> = ({ title, value, selected, testID, onPress }) => (
    <View style={[styles.section, styles.sectionRow]}>
      <Text style={TextTheme.title}>{title}</Text>
      <Pressable
        style={styles.checkboxContainer}
        accessibilityLabel={''}
        accessibilityRole={'checkbox'}
        testID={testIdWithKey('ToggleConnectionInviterCapabilitySwitch')}
      >
        <BouncyCheckbox
          accessibilityLabel={String(AutoLockTime.FiveMinutes)}
          disableText
          fillColor={ColorPallet.brand.secondaryBackground}
          unfillColor={ColorPallet.brand.secondaryBackground}
          size={36}
          innerIconStyle={{ borderColor: ColorPallet.brand.primary, borderWidth: 2 }}
          ImageComponent={() => <Icon name="circle" size={18} color={ColorPallet.brand.primary} />}
          onPress={() => onPress(value)}
          isChecked={selected}
          disableBuiltInState
          testID={testIdWithKey(testID)}
        />
      </Pressable>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={[
          { title: 'Five Minutes', value: AutoLockTime.FiveMinutes, testId: '', onPress: handleTimeoutChange },
          { title: 'Three Minutes', value: AutoLockTime.ThreeMinutes, testId: '', onPress: handleTimeoutChange },
          { title: 'One Minute', value: AutoLockTime.OneMinute, testId: '', onPress: handleTimeoutChange },
          { title: 'Never', value: AutoLockTime.Never, testId: '', onPress: handleTimeoutChange },
        ]}
        renderItem={({ item }) => {
          const data: AutoLockListItem = item
          return (
            <LockoutRow
              title={data.title}
              selected={currentLockoutTime === data.value}
              value={data.value}
              testID={data.testID}
              onPress={data.onPress}
            />
          )
        }}
        ItemSeparatorComponent={() => (
          <View style={{ backgroundColor: SettingsTheme.groupBackground }}>
            <View style={styles.itemSeparator} />
          </View>
        )}
      />
    </SafeAreaView>
  )
}

export default AutoLock
