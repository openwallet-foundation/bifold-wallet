import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../../../core/src/contexts/theme'
import { SettingStackParams, Screens } from '../../../core/src/types/navigators'

const LAST_BACKUP_KEY = '@wallet:lastBackupDate'

type BackupSettingsScreenNavigationProp = StackNavigationProp<SettingStackParams, Screens.BackupSettings>

export const BackupSettingsScreen: React.FC = () => {
  const navigation = useNavigation<BackupSettingsScreenNavigationProp>()
  const { ColorPalette, TextTheme } = useTheme()
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null)

  useEffect(() => {
    loadLastBackupDate()
  }, [])

  const loadLastBackupDate = async () => {
    try {
      const date = await AsyncStorage.getItem(LAST_BACKUP_KEY)
      setLastBackupDate(date)
    } catch (error) {
      console.error('Failed to load last backup date:', error)
    }
  }

  const handleCreateBackup = () => {
    // Navigate to backup screen
    navigation.navigate(Screens.BackupWallet)
  }

  const handleViewRecoveryPhrase = () => {
    // Navigate to view recovery phrase screen
    navigation.navigate(Screens.ViewRecoveryPhrase)
  }

  const handleRestoreFromBackup = () => {
    Alert.alert(
      'Restore Wallet',
      'Restoring from backup will replace your current wallet. Make sure you have backed up your current wallet first.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => navigation.navigate(Screens.RestoreWallet),
        },
      ]
    )
  }

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never'
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Never'
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    scrollView: {
      flex: 1,
    },
    section: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: ColorPalette.grayscale.lightGrey,
    },
    sectionTitle: {
      ...TextTheme.label,
      color: ColorPalette.grayscale.darkGrey,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    infoText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.black,
      marginBottom: 4,
    },
    dateText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      fontSize: 14,
    },
    button: {
      backgroundColor: ColorPalette.brand.primary,
      padding: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: ColorPalette.brand.primary,
    },
    buttonDanger: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: ColorPalette.notification.error,
    },
    buttonText: {
      ...TextTheme.bold,
      fontSize: 16,
      color: ColorPalette.grayscale.white,
    },
    buttonTextSecondary: {
      color: ColorPalette.brand.primary,
    },
    buttonTextDanger: {
      color: ColorPalette.notification.error,
    },
    warningBox: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      padding: 16,
      borderRadius: 8,
      marginBottom: 20,
    },
    warningText: {
      ...TextTheme.normal,
      color: ColorPalette.notification.infoBorder,
      lineHeight: 20,
    },
  })

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Last Backup Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Last Backup</Text>
          <Text style={styles.infoText}>Last backup created:</Text>
          <Text style={styles.dateText}>{formatDate(lastBackupDate)}</Text>
        </View>

        {/* Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup & Recovery</Text>
          
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Always keep your backup file and recovery phrase in a safe place. You'll need both to restore your wallet.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleCreateBackup}
            accessibilityLabel="Create Backup"
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Create Backup</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={handleViewRecoveryPhrase}
            accessibilityLabel="View Recovery Phrase"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, styles.buttonTextSecondary]}>
              View Recovery Phrase
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleRestoreFromBackup}
            accessibilityLabel="Restore from Backup"
            accessibilityRole="button"
          >
            <Text style={[styles.buttonText, styles.buttonTextDanger]}>
              Restore from Backup
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Backup</Text>
          <Text style={[styles.infoText, { fontSize: 14, lineHeight: 20 }]}>
            Your wallet backup consists of two parts:{'\n\n'}
            1. Backup file - Contains your credentials and connections{'\n'}
            2. Recovery phrase - 12 words that encrypt your backup{'\n\n'}
            Keep both safe and never share them with anyone.
          </Text>
        </View>
      </ScrollView>
    </View>
  )
}
