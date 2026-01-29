/**
 * MigrationPrompt Component
 * 
 * Modal prompt that appears when user needs to migrate from old wallet format to new format.
 * Shows benefits, deadline countdown, and action buttons.
 * 
 * Features:
 * - Shows migration benefits
 * - Displays deadline countdown
 * - "Migrate Now" button (primary action)
 * - "Remind Me Later" button (limited to 3 times)
 * - Dismissible with limit
 * - Enforces deadline after 3 months
 * 
 * @module MigrationPrompt
 */

import React from 'react'
import { View, Text, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../contexts/theme'

export interface MigrationPromptProps {
  /** Whether the prompt is visible */
  visible: boolean
  /** Number of times user has postponed */
  postponeCount: number
  /** Days remaining until deadline */
  daysRemaining: number | null
  /** Whether deadline has passed (force migration) */
  deadlinePassed: boolean
  /** Callback when user accepts migration */
  onAccept: () => void
  /** Callback when user postpones migration */
  onPostpone: () => void
}

/**
 * Migration prompt modal component
 */
export const MigrationPrompt: React.FC<MigrationPromptProps> = ({
  visible,
  postponeCount,
  daysRemaining,
  deadlinePassed,
  onAccept,
  onPostpone,
}) => {
  const { t } = useTranslation()
  const { ColorPalette, TextTheme } = useTheme()

  const maxPostpones = 3
  const canPostpone = postponeCount < maxPostpones && !deadlinePassed

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    container: {
      backgroundColor: ColorPalette.brand.primaryBackground,
      borderRadius: 12,
      padding: 24,
      width: '100%',
      maxWidth: 400,
      maxHeight: '80%',
    },
    scrollContent: {
      flexGrow: 1,
    },
    title: {
      ...TextTheme.headingThree,
      color: ColorPalette.brand.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    urgentTitle: {
      ...TextTheme.headingThree,
      color: ColorPalette.notification.error,
      marginBottom: 16,
      textAlign: 'center',
    },
    description: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.black,
      marginBottom: 20,
      lineHeight: 22,
    },
    benefitsContainer: {
      marginBottom: 20,
    },
    benefitsTitle: {
      ...TextTheme.bold,
      color: ColorPalette.grayscale.black,
      marginBottom: 12,
    },
    benefitItem: {
      flexDirection: 'row',
      marginBottom: 10,
      alignItems: 'flex-start',
    },
    benefitBullet: {
      ...TextTheme.normal,
      color: ColorPalette.brand.primary,
      marginRight: 8,
      fontSize: 18,
    },
    benefitText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.black,
      flex: 1,
      lineHeight: 20,
    },
    deadlineContainer: {
      backgroundColor: deadlinePassed 
        ? ColorPalette.notification.error + '20'
        : daysRemaining !== null && daysRemaining <= 7
        ? ColorPalette.notification.warn + '20'
        : ColorPalette.notification.info + '20',
      borderRadius: 8,
      padding: 12,
      marginBottom: 20,
    },
    deadlineText: {
      ...TextTheme.normal,
      color: deadlinePassed
        ? ColorPalette.notification.error
        : daysRemaining !== null && daysRemaining <= 7
        ? ColorPalette.notification.warn
        : ColorPalette.notification.info,
      textAlign: 'center',
      fontWeight: '600',
    },
    buttonsContainer: {
      gap: 12,
    },
    primaryButton: {
      backgroundColor: ColorPalette.brand.primary,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    primaryButtonText: {
      ...TextTheme.bold,
      color: ColorPalette.grayscale.white,
      fontSize: 16,
    },
    secondaryButton: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: ColorPalette.grayscale.mediumGrey,
      borderRadius: 8,
      padding: 16,
      alignItems: 'center',
    },
    secondaryButtonText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.darkGrey,
      fontSize: 16,
    },
    disabledButton: {
      opacity: 0.5,
    },
  })

  const benefits = [
    t('Migration.Benefit1', 'Restore your wallet on any device'),
    t('Migration.Benefit2', 'Industry-standard security (BIP39)'),
    t('Migration.Benefit3', 'No vendor lock-in'),
    t('Migration.Benefit4', 'Compatible with other SSI wallets'),
  ]

  const getDeadlineMessage = () => {
    if (deadlinePassed) {
      return t('Migration.DeadlinePassed', 'Migration deadline has passed. You must migrate now.')
    }
    if (daysRemaining !== null) {
      if (daysRemaining === 0) {
        return t('Migration.DeadlineToday', 'Migration deadline is today!')
      }
      if (daysRemaining === 1) {
        return t('Migration.DeadlineTomorrow', 'Migration deadline is tomorrow!')
      }
      if (daysRemaining <= 7) {
        return t('Migration.DeadlineUrgent', `Only ${daysRemaining} days remaining until migration deadline`)
      }
      return t('Migration.DeadlineRemaining', `${daysRemaining} days remaining until migration deadline`)
    }
    return null
  }

  const deadlineMessage = getDeadlineMessage()

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={canPostpone ? onPostpone : undefined}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={deadlinePassed ? styles.urgentTitle : styles.title}>
              {deadlinePassed 
                ? t('Migration.TitleUrgent', '⚠️ Migration Required')
                : t('Migration.Title', '🔄 Wallet Upgrade Available')}
            </Text>

            <Text style={styles.description}>
              {deadlinePassed
                ? t('Migration.DescriptionUrgent', 
                    'Your wallet needs to be upgraded to the new secure format. This is required to continue using the app.')
                : t('Migration.Description', 
                    'Upgrade your wallet to the new secure format for better portability and industry-standard security.')}
            </Text>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>
                {t('Migration.BenefitsTitle', 'Benefits:')}
              </Text>
              {benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitBullet}>✓</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            {deadlineMessage && (
              <View style={styles.deadlineContainer}>
                <Text style={styles.deadlineText}>{deadlineMessage}</Text>
              </View>
            )}

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={onAccept}
                accessibilityLabel={t('Migration.MigrateNow', 'Migrate Now')}
                accessibilityRole="button"
              >
                <Text style={styles.primaryButtonText}>
                  {t('Migration.MigrateNow', 'Migrate Now')}
                </Text>
              </TouchableOpacity>

              {canPostpone && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={onPostpone}
                  accessibilityLabel={t('Migration.RemindLater', 'Remind Me Later')}
                  accessibilityRole="button"
                  accessibilityHint={t('Migration.RemindLaterHint', 
                    `You can postpone ${maxPostpones - postponeCount} more times`)}
                >
                  <Text style={styles.secondaryButtonText}>
                    {t('Migration.RemindLater', 'Remind Me Later')} 
                    {` (${maxPostpones - postponeCount} left)`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

export default MigrationPrompt
