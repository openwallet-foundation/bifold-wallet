/**
 * Migration Flow Screen
 *
 * Orchestrates the complete wallet migration process through 6 steps:
 * 1. Force backup creation (mandatory)
 * 2. Generate and display new mnemonic
 * 3. Verify mnemonic saved
 * 4. Execute migration (show progress)
 * 5. Set PIN (can be same or new)
 * 6. Display completion message
 *
 * Features:
 * - Progress indicator (6 steps)
 * - Error handling with rollback
 * - Styled with theme
 * - Full accessibility labels
 * - Clear user feedback at each step
 *
 * @module MigrationFlowScreen
 */

import React, { useState, useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, DeviceEventEmitter } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useAgent } from '@credo-ts/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import { ParamListBase } from '@react-navigation/native'
import { container } from 'tsyringe'

import { useTheme } from '../contexts/theme'
import { useAuth } from '../contexts/auth'
import { ProgressIndicator, createSteps, StepStatus } from '../components/ProgressIndicator'
import { MnemonicDisplay } from '../components/MnemonicDisplay'
import { MnemonicVerification } from '../components/MnemonicVerification'
import { MigrationService, MigrationStatus, MigrationError } from '../services/MigrationService'
import { BackupService } from '@bifold/backup'
import { testIdWithKey } from '../utils/testable'
import ScreenWrapper from '../components/views/ScreenWrapper'
import PINInput from '../components/inputs/PINInput'
import { EventTypes } from '../constants'
import { BifoldError } from '../types/error'
import { minPINLength } from '../constants'
import { RootStackParams } from '../types/navigators'

type MigrationFlowScreenProps = StackScreenProps<RootStackParams>

type MigrationStep =
  | 'backup'
  | 'mnemonic'
  | 'verification'
  | 'migration'
  | 'pin'
  | 'complete'
  | 'error'

/**
 * Migration Flow Screen
 *
 * Guides users through the 6-step migration process.
 */
const MigrationFlowScreen: React.FC<MigrationFlowScreenProps> = ({ navigation }) => {
  const { t } = useTranslation()
  const { ColorPalette, TextTheme } = useTheme()
  const { agent } = useAgent()
  const { setPIN: setWalletPIN } = useAuth()

  // Services
  const [migrationService] = useState(() => container.resolve(MigrationService))
  const [backupService] = useState(() => container.resolve(BackupService))

  // State
  const [currentStep, setCurrentStep] = useState<MigrationStep>('backup')
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>(MigrationStatus.BACKING_UP)
  const [mnemonic, setMnemonic] = useState<string>('')
  const [backupPath, setBackupPath] = useState<string>('')
  const [oldPIN, setOldPIN] = useState<string>('')
  const [newPIN, setNewPIN] = useState<string>('')
  const [confirmedPIN, setConfirmedPIN] = useState<string>('')
  const [error, setError] = useState<MigrationError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Steps for progress indicator
  const stepLabels: string[] = [
    String(t('Migration.StepBackup', 'Backup')),
    String(t('Migration.StepMnemonic', 'Recovery Phrase')),
    String(t('Migration.StepVerify', 'Verify')),
    String(t('Migration.StepMigrate', 'Migrate')),
    String(t('Migration.StepPIN', 'Set PIN')),
    String(t('Migration.StepComplete', 'Complete')),
  ]

  const getStepIndex = (step: MigrationStep): number => {
    const stepMap: Record<MigrationStep, number> = {
      'backup': 0,
      'mnemonic': 1,
      'verification': 2,
      'migration': 3,
      'pin': 4,
      'complete': 5,
      'error': 3,
    }
    return stepMap[step]
  }

  const getSteps = () => {
    const currentIndex = getStepIndex(currentStep)
    const errorStep = currentStep === 'error' ? currentIndex : undefined
    return createSteps(stepLabels, currentIndex, errorStep)
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    scrollContainer: {
      flexGrow: 1,
      padding: 20,
    },
    title: {
      ...TextTheme.headingThree,
      color: ColorPalette.brand.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    description: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginBottom: 24,
      textAlign: 'center',
    },
    warningBox: {
      backgroundColor: ColorPalette.notification.warnBackground,
      borderLeftWidth: 4,
      borderLeftColor: ColorPalette.notification.warn,
      padding: 16,
      marginBottom: 24,
      borderRadius: 8,
    },
    warningTitle: {
      ...TextTheme.bold,
      color: ColorPalette.notification.warnText,
      marginBottom: 8,
    },
    warningText: {
      ...TextTheme.normal,
      color: ColorPalette.notification.warnText,
      lineHeight: 22,
    },
    pinInputContainer: {
      marginBottom: 24,
    },
    pinInputLabel: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.black,
      marginBottom: 12,
    },
    button: {
      backgroundColor: ColorPalette.brand.primary,
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 12,
    },
    buttonDisabled: {
      backgroundColor: ColorPalette.grayscale.lightGrey,
    },
    buttonText: {
      ...TextTheme.bold,
      color: ColorPalette.grayscale.white,
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: ColorPalette.grayscale.mediumGrey,
    },
    secondaryButtonText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.darkGrey,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    loadingText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      marginTop: 16,
      textAlign: 'center',
    },
    statusText: {
      ...TextTheme.normal,
      color: ColorPalette.brand.primary,
      marginTop: 8,
      textAlign: 'center',
    },
    errorContainer: {
      backgroundColor: ColorPalette.notification.errorBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    errorTitle: {
      ...TextTheme.bold,
      color: ColorPalette.notification.errorText,
      fontSize: 18,
      marginBottom: 12,
    },
    errorText: {
      ...TextTheme.normal,
      color: ColorPalette.notification.errorText,
      lineHeight: 22,
      marginBottom: 16,
    },
    errorHint: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      lineHeight: 22,
    },
    successContainer: {
      backgroundColor: ColorPalette.notification.successBackground,
      borderRadius: 12,
      padding: 20,
      marginBottom: 24,
    },
    successTitle: {
      ...TextTheme.bold,
      color: ColorPalette.notification.successText,
      fontSize: 18,
      marginBottom: 12,
    },
    successText: {
      ...TextTheme.normal,
      color: ColorPalette.notification.successText,
      lineHeight: 22,
    },
  })

  // Step 1: Backup - Force user to create backup
  const renderBackupStep = () => {
    const handleCreateBackup = async () => {
      if (!oldPIN || oldPIN.length < minPINLength) {
        Alert.alert(t('Migration.InvalidPIN', 'Invalid PIN'), t('Migration.EnterValidPIN', 'Please enter your current PIN'))
        return
      }

      setIsLoading(true)

      try {
        // Export wallet with old PIN to get mnemonic and create backup
        const recoveryMnemonic = await (backupService as any).exportWalletWithMnemonic(agent, oldPIN)

        // Store mnemonic for migration
        setMnemonic(recoveryMnemonic)

        // Store backup path (would be created by BackupService)
        const timestamp = Date.now()
        const path = `/migration_backup_${timestamp}.zip`
        setBackupPath(path)

        // Move to next step
        setCurrentStep('mnemonic')
      } catch (err) {
        const errorMessage = (err as Error).message || 'Failed to create backup'

        if (errorMessage.includes('Incorrect PIN')) {
          Alert.alert(
            t('Migration.IncorrectPIN', 'Incorrect PIN'),
            t('Migration.IncorrectPINMessage', 'The PIN you entered is incorrect. Please try again.')
          )
        } else {
          const error = new BifoldError(
            t('Error.Title1050', 'Backup Failed'),
            t('Error.Message1050', 'Failed to create wallet backup. Please try again.'),
            errorMessage,
            1050
          )
          // Emit error event
          DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <View>
        <Text style={styles.title}>{t('Migration.BackupTitle', 'Create Wallet Backup')}</Text>
        <Text style={styles.description}>
          {t('Migration.BackupDescription',
            'Before we migrate your wallet, we need to create a backup. Enter your current PIN to continue.')}
        </Text>

        <View style={styles.warningBox}>
          <Text style={styles.warningTitle}>{t('Migration.Important', 'Important')}</Text>
          <Text style={styles.warningText}>
            {t('Migration.BackupWarning',
              'A backup is required before migration. If anything goes wrong, we can restore your wallet from this backup.')}
          </Text>
        </View>

        <View style={styles.pinInputContainer}>
          <Text style={styles.pinInputLabel}>{t('Migration.EnterCurrentPIN', 'Enter Current PIN')}</Text>
          <PINInput
            label={t('Migration.PINLabel', 'PIN')}
            onPINChanged={setOldPIN}
            testID={testIdWithKey('OldPIN')}
            accessibilityLabel={t('Migration.EnterCurrentPIN', 'Enter Current PIN')}
            autoFocus
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (!oldPIN || oldPIN.length < minPINLength || isLoading) && styles.buttonDisabled]}
          onPress={handleCreateBackup}
          disabled={!oldPIN || oldPIN.length < minPINLength || isLoading}
          accessibilityLabel={t('Migration.CreateBackup', 'Create Backup')}
          accessibilityRole="button"
          testID={testIdWithKey('CreateBackup')}
        >
          {isLoading ? (
            <ActivityIndicator color={ColorPalette.grayscale.white} />
          ) : (
            <Text style={styles.buttonText}>{t('Migration.CreateBackup', 'Create Backup')}</Text>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  // Step 2: Display Mnemonic
  const renderMnemonicStep = () => {
    const handleContinue = () => {
      setCurrentStep('verification')
    }

    const handleBack = () => {
      setCurrentStep('backup')
      setMnemonic('')
      setOldPIN('')
    }

    return (
      <MnemonicDisplay
        mnemonic={mnemonic}
        title={t('Migration.NewRecoveryPhrase', 'Your New Recovery Phrase')}
        description={t('Migration.MnemonicDescription',
          'This is your new 12-word recovery phrase. Write it down on paper and store it safely. You\'ll need it to restore your wallet.')}
        showCopyButton={true}
        showWarning={true}
        requireConfirmation={true}
        showBlurEffect={true}
        onConfirmed={handleContinue}
        onContinue={handleContinue}
      />
    )
  }

  // Step 3: Verify Mnemonic
  const renderVerificationStep = () => {
    const handleVerified = () => {
      setCurrentStep('migration')
      startMigration()
    }

    const handleFailed = () => {
      setCurrentStep('mnemonic')
    }

    return (
      <MnemonicVerification
        mnemonic={mnemonic}
        wordsToVerify={3}
        maxAttempts={3}
        onVerified={handleVerified}
        onFailed={handleFailed}
      />
    )
  }

  // Step 4: Execute Migration
  const startMigration = useCallback(async () => {
    if (!agent) {
      Alert.alert(t('Migration.Error', 'Error'), t('Migration.AgentNotReady', 'Agent not ready'))
      return
    }

    setIsLoading(true)
    setCurrentStep('migration')

    try {
      const result = await migrationService.migrateWallet(
        agent,
        false, // useBiometrics
        (status: MigrationStatus) => {
          setMigrationStatus(status)
        }
      )

      if (result.success) {
        setCurrentStep('pin')
      } else {
        setError(result.error || null)
        setCurrentStep('error')
      }
    } catch (err) {
      setError(err as MigrationError)
      setCurrentStep('error')
    } finally {
      setIsLoading(false)
    }
  }, [agent, oldPIN, newPIN, migrationService])

  const renderMigrationStep = () => {
    const getStatusMessage = () => {
      switch (migrationStatus) {
        case MigrationStatus.BACKING_UP:
          return t('Migration.StatusBackingUp', 'Backing up wallet...')
        case MigrationStatus.EXPORTING_DATA:
          return t('Migration.StatusExporting', 'Exporting wallet data...')
        case MigrationStatus.GENERATING_MNEMONIC:
          return t('Migration.StatusGenerating', 'Generating new recovery phrase...')
        case MigrationStatus.CREATING_WALLET:
          return t('Migration.StatusCreatingWallet', 'Creating new wallet...')
        case MigrationStatus.IMPORTING_DATA:
          return t('Migration.StatusImporting', 'Importing wallet data...')
        case MigrationStatus.UPDATING_KEYCHAIN:
          return t('Migration.StatusUpdatingKeychain', 'Updating secure storage...')
        case MigrationStatus.VERIFYING:
          return t('Migration.StatusVerifying', 'Verifying migration...')
        case MigrationStatus.CLEANING_UP:
          return t('Migration.StatusCleaning', 'Cleaning up...')
        case MigrationStatus.COMPLETE:
          return t('Migration.StatusComplete', 'Migration complete!')
        default:
          return t('Migration.StatusProcessing', 'Processing...')
      }
    }

    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ColorPalette.brand.primary} />
        <Text style={styles.loadingText}>{t('Migration.Migrating', 'Migrating your wallet...')}</Text>
        <Text style={styles.statusText}>{getStatusMessage()}</Text>
      </View>
    )
  }

  // Step 5: Set PIN
  const renderPINStep = () => {
    const handleSetPIN = async () => {
      if (newPIN.length < minPINLength) {
        Alert.alert(t('Migration.InvalidPIN', 'Invalid PIN'), t('Migration.EnterValidPIN', 'Please enter a valid PIN'))
        return
      }

      if (newPIN !== confirmedPIN) {
        Alert.alert(t('Migration.PINMismatch', 'PIN Mismatch'), t('Migration.PINMismatchMessage', 'PINs do not match. Please try again.'))
        return
      }

      setIsLoading(true)

      try {
        await setWalletPIN(newPIN)
        setCurrentStep('complete')
      } catch (err) {
        const error = new BifoldError(
          t('Error.Title1051', 'PIN Set Failed'),
          t('Error.Message1051', 'Failed to set new PIN. Please try again.'),
          (err as Error)?.message ?? err,
          1051
        )
        DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <View>
        <Text style={styles.title}>{t('Migration.SetPINTitle', 'Set Your PIN')}</Text>
        <Text style={styles.description}>
          {t('Migration.SetPINDescription',
            'Choose a PIN to protect your wallet. You can use the same PIN or create a new one.')}
        </Text>

        <View style={styles.pinInputContainer}>
          <PINInput
            label={t('Migration.EnterNewPIN', 'Enter New PIN')}
            onPINChanged={setNewPIN}
            testID={testIdWithKey('NewPIN')}
            accessibilityLabel={t('Migration.EnterNewPIN', 'Enter New PIN')}
            autoFocus
          />
        </View>

        <View style={styles.pinInputContainer}>
          <PINInput
            label={t('Migration.ConfirmPIN', 'Confirm PIN')}
            onPINChanged={setConfirmedPIN}
            testID={testIdWithKey('ConfirmPIN')}
            accessibilityLabel={t('Migration.ConfirmPIN', 'Confirm PIN')}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (newPIN.length < minPINLength || confirmedPIN.length < minPINLength || isLoading) && styles.buttonDisabled]}
          onPress={handleSetPIN}
          disabled={newPIN.length < minPINLength || confirmedPIN.length < minPINLength || isLoading}
          accessibilityLabel={t('Migration.SetPIN', 'Set PIN')}
          accessibilityRole="button"
          testID={testIdWithKey('SetPIN')}
        >
          {isLoading ? (
            <ActivityIndicator color={ColorPalette.grayscale.white} />
          ) : (
            <Text style={styles.buttonText}>{t('Migration.SetPIN', 'Set PIN')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            setNewPIN(oldPIN)
            setConfirmedPIN(oldPIN)
            handleSetPIN()
          }}
          accessibilityLabel={t('Migration.UseOldPIN', 'Use Same PIN')}
          accessibilityRole="button"
          testID={testIdWithKey('UseOldPIN')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            {t('Migration.UseOldPIN', 'Use Same PIN')}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Step 6: Complete
  const renderCompleteStep = () => {
    const handleFinish = () => {
      navigation.goBack()
    }

    return (
      <View>
        <Text style={styles.title}>{t('Migration.CompleteTitle', 'Migration Complete!')}</Text>
        <Text style={styles.description}>
          {t('Migration.CompleteDescription',
            'Your wallet has been successfully migrated to the new format. You can now use your recovery phrase to restore your wallet on any device.')}
        </Text>

        <View style={styles.successContainer}>
          <Text style={styles.successTitle}>{t('Migration.WhatNextTitle', 'What\'s Next?')}</Text>
          <Text style={styles.successText}>
            {t('Migration.WhatNextText',
              '• Your wallet is now using the new format\n• Your recovery phrase has been saved\n• You can restore your wallet on any device\n• Your credentials and data are preserved')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleFinish}
          accessibilityLabel={t('Migration.Finish', 'Finish')}
          accessibilityRole="button"
          testID={testIdWithKey('Finish')}
        >
          <Text style={styles.buttonText}>{t('Migration.Finish', 'Finish')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Error Step
  const renderErrorStep = () => {
    const handleRetry = () => {
      setError(null)
      setCurrentStep('backup')
      setMnemonic('')
      setOldPIN('')
      setNewPIN('')
      setConfirmedPIN('')
    }

    const handleCancel = () => {
      navigation.goBack()
    }

    const getErrorMessage = () => {
      if (!error) return t('Migration.UnknownError', 'An unknown error occurred')

      switch (error.type) {
        case 'BACKUP_FAILED':
          return t('Migration.ErrorBackup', 'Failed to create backup. Please ensure you have enough storage space.')
        case 'EXPORT_FAILED':
          return t('Migration.ErrorExport', 'Failed to export wallet data. Please try again.')
        case 'WALLET_CREATION_FAILED':
          return t('Migration.ErrorWalletCreate', 'Failed to create new wallet. Please try again.')
        case 'IMPORT_FAILED':
          return t('Migration.ErrorImport', 'Failed to import wallet data. Please try again.')
        case 'KEYCHAIN_UPDATE_FAILED':
          return t('Migration.ErrorKeychain', 'Failed to update secure storage. Please try again.')
        case 'VERIFICATION_FAILED':
          return t('Migration.ErrorVerification', 'Migration verification failed. Please try again.')
        case 'ROLLBACK_FAILED':
          return t('Migration.ErrorRollback', 'Failed to rollback after error. Your wallet may be in an inconsistent state. Please contact support.')
        default:
          return error.message
      }
    }

    return (
      <View>
        <Text style={styles.title}>{t('Migration.ErrorTitle', 'Migration Failed')}</Text>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>{t('Migration.SomethingWentWrong', 'Something Went Wrong')}</Text>
          <Text style={styles.errorText}>{getErrorMessage()}</Text>
          <Text style={styles.errorHint}>
            {t('Migration.ErrorHint',
              'Don\'t worry! If a backup was created, your wallet can be restored. Please try again or contact support if the problem persists.')}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleRetry}
          accessibilityLabel={t('Migration.TryAgain', 'Try Again')}
          accessibilityRole="button"
          testID={testIdWithKey('TryAgain')}
        >
          <Text style={styles.buttonText}>{t('Migration.TryAgain', 'Try Again')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleCancel}
          accessibilityLabel={t('Migration.Cancel', 'Cancel')}
          accessibilityRole="button"
          testID={testIdWithKey('Cancel')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>{t('Migration.Cancel', 'Cancel')}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ProgressIndicator steps={getSteps()} currentStep={getStepIndex(currentStep)} />

        <View style={styles.scrollContainer}>
          {currentStep === 'backup' && renderBackupStep()}
          {currentStep === 'mnemonic' && renderMnemonicStep()}
          {currentStep === 'verification' && renderVerificationStep()}
          {currentStep === 'migration' && renderMigrationStep()}
          {currentStep === 'pin' && renderPINStep()}
          {currentStep === 'complete' && renderCompleteStep()}
          {currentStep === 'error' && renderErrorStep()}
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default MigrationFlowScreen
