import { Pressable, StyleSheet, Text, View, FlatList } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import { AutoLockTime } from '../contexts/activity'
import { testIdWithKey } from '../utils/testable'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import React from 'react'

import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'

type AutoLockListItem = {
  title: string
  value: (typeof AutoLockTime)[keyof typeof AutoLockTime]
  testID: string
  onPress: (val: (typeof AutoLockTime)[keyof typeof AutoLockTime]) => void
}

type LockoutRowProps = AutoLockListItem & {
  selected: boolean
}

const AutoLock: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { ColorPallet, SettingsTheme, TextTheme } = useTheme()
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

  const LockoutRow: React.FC<LockoutRowProps> = ({ title, value, selected, testID, onPress }) => (
    <View style={[styles.section, styles.sectionRow]}>
      <Text style={TextTheme.title}>{title}</Text>
      <Pressable
        style={styles.checkboxContainer}
        accessibilityLabel={title}
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
          {
            title: t('AutoLockTimes.FiveMinutes'),
            value: AutoLockTime.FiveMinutes,
            testID: `auto-lock-time-${AutoLockTime.FiveMinutes}`,
            onPress: handleTimeoutChange,
          },
          {
            title: t('AutoLockTimes.ThreeMinutes'),
            value: AutoLockTime.ThreeMinutes,
            testID: `auto-lock-time-${AutoLockTime.ThreeMinutes}`,
            onPress: handleTimeoutChange,
          },
          {
            title: t('AutoLockTimes.OneMinute'),
            value: AutoLockTime.OneMinute,
            testID: `auto-lock-time-${AutoLockTime.OneMinute}`,
            onPress: handleTimeoutChange,
          },
          {
            title: t('AutoLockTimes.Never'),
            value: AutoLockTime.Never,
            testID: `auto-lock-time-${AutoLockTime.Never}`,
            onPress: handleTimeoutChange,
          },
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
