import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import IconButton, { ButtonLocation } from '../buttons/IconButton'
import { ThemedText } from '../texts/ThemedText'

interface FauxHeaderProps {
  title: string
  onBackPressed: () => void
}

// Used for modals that we want to look like regular screens
const FauxHeader: React.FC<FauxHeaderProps> = ({ title, onBackPressed }) => {
  const { ColorPalette, Spacing, NavigationTheme } = useTheme()
  const { t } = useTranslation()
  const styles = StyleSheet.create({
    header: {
      backgroundColor: NavigationTheme.colors.primary,
      elevation: 0,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 6,
      shadowColor: ColorPalette.grayscale.black,
      shadowOpacity: 0.15,
      zIndex: 2,
      borderWidth: 0,
      flexDirection: 'row',
      alignItems: 'stretch',
      minHeight: Platform.OS === 'ios' ? 44 : 56,
    },
    left: {
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    titleContainer: {
      marginHorizontal: Spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 1,
      maxWidth: '68%',
      width: '100%',
    },
    title: {
      textAlign: 'center',
    },
    right: {
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
  })

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <IconButton
          buttonLocation={ButtonLocation.Left}
          accessibilityLabel={t('Global.Back')}
          testID={testIdWithKey('BackButton')}
          onPress={onBackPressed}
          icon="chevron-left"
        />
      </View>
      <View style={styles.titleContainer}>
        <ThemedText variant={'headerTitle'} numberOfLines={1} ellipsizeMode="tail" style={styles.title}>
          {title}
        </ThemedText>
      </View>
      <View style={styles.right}></View>
    </View>
  )
}

export default FauxHeader
