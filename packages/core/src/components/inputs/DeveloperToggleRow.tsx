import React from 'react'
import { View, StyleSheet, Pressable, Switch } from 'react-native'
import { ThemedText } from '../texts/ThemedText'
import { useTheme } from '../../contexts/theme'

interface DeveloperToggleRowProps {
  label: string
  value: boolean
  onToggle: () => void
  accessibilityLabel: string
  pressableTestId: string
  switchTestId: string
}

const DeveloperToggleRow: React.FC<DeveloperToggleRowProps> = ({
  label,
  value,
  onToggle,
  accessibilityLabel,
  pressableTestId,
  switchTestId,
}) => {
  const { ColorPalette } = useTheme()
  return (
    <View style={styles.settingContainer}>
      <View style={{ flex: 1 }}>
        <ThemedText variant="bold" style={styles.settingLabelText}>
          {label}
        </ThemedText>
      </View>
      <Pressable
        style={styles.settingSwitchContainer}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="switch"
        testID={pressableTestId}
      >
        <Switch
          trackColor={{ false: ColorPalette.grayscale.lightGrey, true: ColorPalette.brand.primaryDisabled }}
          thumbColor={value ? ColorPalette.brand.primary : ColorPalette.grayscale.mediumGrey}
          ios_backgroundColor={ColorPalette.grayscale.lightGrey}
          onValueChange={onToggle}
          testID={switchTestId}
          value={value}
        />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  settingContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabelText: {
    marginRight: 10,
    textAlign: 'left',
  },
  settingSwitchContainer: {
    justifyContent: 'center',
  },
})

export default DeveloperToggleRow
