import { Pressable, StyleSheet, View, FlatList } from 'react-native'
import BouncyCheckbox from 'react-native-bouncy-checkbox'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { AutoLockTime } from '../contexts/activity'
import { testIdWithKey } from '../utils/testable'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { useTheme } from '../contexts/theme'
import { ThemedText } from '../components/texts/ThemedText'
import { useServices, TOKENS } from '../container-api'

type AutoLockListItem = {
  title: string
  value: number
  testID: string
  onPress: (val: number) => void
}

type LockoutRowProps = AutoLockListItem & {
  selected: boolean
}

const AutoLock: React.FC = () => {
  const { t } = useTranslation()
  const [store, dispatch] = useStore()
  const { ColorPalette, SettingsTheme } = useTheme()
  const [{ customAutoLockTimes }] = useServices([TOKENS.CONFIG])
  const defaultAutoLockoutTime = customAutoLockTimes?.default?.time ?? AutoLockTime.FiveMinutes
  const currentLockoutTime = store.preferences?.autoLockTime ?? defaultAutoLockoutTime
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

  const handleTimeoutChange = (time: number) => {
    dispatch({
      type: DispatchAction.AUTO_LOCK_TIME,
      payload: [time],
    })
  }

  const autoLockTimes = customAutoLockTimes ? 
    customAutoLockTimes?.values.map((timer) => {
      return {
        title: timer?.title ?? '',
        value: timer?.time ?? 0,
        testID: `auto-lock-time-${timer.time}`,
        onPress: handleTimeoutChange,
      }
    })
  : 
    [
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
    ]

  const LockoutRow: React.FC<LockoutRowProps> = ({ title, value, selected, testID, onPress }) => (
    <View style={[styles.section, styles.sectionRow]}>
      <ThemedText variant="title">{title}</ThemedText>
      <Pressable
        style={styles.checkboxContainer}
        accessibilityLabel={title}
        accessibilityRole={'checkbox'}
        testID={testIdWithKey('ToggleConnectionInviterCapabilitySwitch')}
      >
        <BouncyCheckbox
          accessibilityLabel={title}
          disableText
          fillColor={ColorPalette.brand.secondaryBackground}
          unfillColor={ColorPalette.brand.secondaryBackground}
          size={36}
          innerIconStyle={{ borderColor: ColorPalette.brand.primary, borderWidth: 2 }}
          ImageComponent={() => <Icon name="circle" size={18} color={ColorPalette.brand.primary} />}
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
        data={autoLockTimes}
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
