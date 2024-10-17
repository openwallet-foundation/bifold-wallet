import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { ColorPallet, TextTheme } from '../theme'
import { LockOutTime } from '../components/misc/InactivityWrapper'
import { testIdWithKey } from '../utils/testable'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import React from 'react'

const Lockout: React.FC = () => {
  const [store, dispatch] = useStore()
  const currentLockoutTime = store.lockout.lockoutTime ?? LockOutTime.FiveMinutes
  const styles = StyleSheet.create({
    container: {
      backgroundColor: ColorPallet.brand.primaryBackground,
      width: '100%',
    },
    settingContainer: {
      flexDirection: 'row',
      marginVertical: 1,
      padding: 10,
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.secondaryBackground,
    },
    settingLabelText: {
      ...TextTheme.bold,
      marginRight: 10,
      textAlign: 'left',
    },
    checkboxContainer: {
      justifyContent: 'center',
      marginRight: 20,
    },
  })

  const handleTimeoutChange = (time: (typeof LockOutTime)[keyof typeof LockOutTime]) => {
    dispatch({
      type: DispatchAction.LOCKOUT_TIME_UPDATED,
      payload: [time],
    })
  }

  const LockoutRow: React.FC<{
    title: string
    selected: boolean
    value: (typeof LockOutTime)[keyof typeof LockOutTime]
    testID: string
    onPress: (val: (typeof LockOutTime)[keyof typeof LockOutTime]) => void
  }> = ({ title, value, selected, testID, onPress }) => {
    return (
      <View style={styles.settingContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabelText}>{title}</Text>
        </View>
        <Pressable
          style={styles.checkboxContainer}
          accessibilityLabel={''}
          accessibilityRole={'checkbox'}
          testID={testIdWithKey('ToggleConnectionInviterCapabilitySwitch')}
        >
          <BouncyCheckbox
            accessibilityLabel={String(LockOutTime.FiveMinutes)}
            disableText
            fillColor={ColorPallet.brand.secondaryBackground}
            unfillColor={ColorPallet.brand.secondaryBackground}
            size={36}
            innerIconStyle={{ borderColor: ColorPallet.brand.primary, borderWidth: 2 }}
            ImageComponent={() => <Icon name="circle" size={18} color={ColorPallet.brand.primary}></Icon>}
            onPress={() => onPress(value)}
            isChecked={selected}
            disableBuiltInState
            testID={testIdWithKey(testID)}
          />
        </Pressable>
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={styles.container}>
        <LockoutRow
          title={'Five Minutes'}
          selected={currentLockoutTime === LockOutTime.FiveMinutes}
          value={LockOutTime.FiveMinutes}
          testID={''}
          onPress={handleTimeoutChange}
        />
        <LockoutRow
          title={'Three Minutes'}
          selected={currentLockoutTime === LockOutTime.ThreeMinutes}
          value={LockOutTime.ThreeMinutes}
          testID={''}
          onPress={handleTimeoutChange}
        />
        <LockoutRow
          title={'One Minutes'}
          selected={currentLockoutTime === LockOutTime.OneMinute}
          value={LockOutTime.OneMinute}
          testID={''}
          onPress={handleTimeoutChange}
        />
        <LockoutRow
          title={'Never'}
          selected={currentLockoutTime === LockOutTime.Never}
          value={LockOutTime.Never}
          testID={''}
          onPress={handleTimeoutChange}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

export default Lockout
