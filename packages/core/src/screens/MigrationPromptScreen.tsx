/**
 * Migration Prompt Screen
 *
 * Screen that prompts users to migrate from old wallet format to new format.
 * Shows migration benefits, deadline information, and action buttons.
 *
 * Features:
 * - Explains migration benefits clearly
 * - Shows "Migrate Now" button (primary action)
 * - Shows "Remind Me Later" button (max 3 times)
 * - Shows "Learn More" link with detailed information
 * - Tracks postpone count
 * - Styled with theme
 * - Full accessibility labels
 *
 * @module MigrationPromptScreen
 */

import React, { useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import { StackScreenProps } from '@react-navigation/stack'
import { ParamListBase } from '@react-navigation/native'

import { useTheme } from '../contexts/theme'
import { useMigrationPrompt } from '../hooks/useMigrationPrompt'
import ScreenWrapper from '../components/views/ScreenWrapper'
import { testIdWithKey } from '../utils/testable'
import { Screens } from '../types/navigators'

type MigrationPromptScreenProps = StackScreenProps<ParamListBase>

/**
 * Migration Prompt Screen
 *
 * Displays migration prompt with benefits, deadline info, and action buttons.
 */
const MigrationPromptScreen: React.FC<MigrationPromptScreenProps> = ({ navigation }) => {
  const { t } = useTranslation()
  const { ColorPalette, TextTheme } = useTheme()
  const [showLearnMore, setShowLearnMore] = useState(false)

  const handleMigrationAccepted = useCallback(() => {
    navigation.navigate(Screens.MigrationFlow as never)
  }, [navigation])

  const {
    showPrompt,
    postponeCount,
    daysRemaining,
    deadlinePassed,
    handleAccept,
    handlePostpone,
  } = useMigrationPrompt(handleMigrationAccepted)

  const maxPostpones = 3
  const canPostpone = postponeCount < maxPostpones && !deadlinePassed

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
      color: deadlinePassed ? ColorPalette.notification.error : ColorPalette.brand.primary,
      marginBottom: 16,
      textAlign: 'center',
    },
    description: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.black,
      marginBottom: 24,
      lineHeight: 22,
      textAlign: 'center',
    },
    benefitsContainer: {
      marginBottom: 24,
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 12,
      padding: 20,
    },
    benefitsTitle: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primary,
      fontSize: 18,
      marginBottom: 16,
    },
    benefitItem: {
      flexDirection: 'row',
      marginBottom: 12,
      alignItems: 'flex-start',
    },
    benefitBullet: {
      ...TextTheme.normal,
      color: ColorPalette.notification.success,
      marginRight: 10,
      fontSize: 20,
      marginTop: -2,
    },
    benefitText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.black,
      flex: 1,
      lineHeight: 22,
    },
    deadlineContainer: {
      backgroundColor:
        deadlinePassed
          ? ColorPalette.notification.errorBackground
          : daysRemaining !== null && daysRemaining <= 7
          ? ColorPalette.notification.warnBackground
          : ColorPalette.notification.infoBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor:
        deadlinePassed
          ? ColorPalette.notification.error
          : daysRemaining !== null && daysRemaining <= 7
          ? ColorPalette.notification.warn
          : ColorPalette.notification.info,
    },
    deadlineText: {
      ...TextTheme.bold,
      color:
        deadlinePassed
          ? ColorPalette.notification.error
          : daysRemaining !== null && daysRemaining <= 7
          ? ColorPalette.notification.warn
          : ColorPalette.notification.info,
      textAlign: 'center',
    },
    learnMoreContainer: {
      marginBottom: 24,
    },
    learnMoreButton: {
      alignItems: 'center',
    },
    learnMoreText: {
      ...TextTheme.normal,
      color: ColorPalette.brand.primary,
      textDecorationLine: 'underline',
    },
    learnMoreContent: {
      backgroundColor: ColorPalette.brand.secondaryBackground,
      borderRadius: 12,
      padding: 16,
      marginTop: 12,
    },
    learnMoreSection: {
      marginBottom: 16,
    },
    learnMoreSectionTitle: {
      ...TextTheme.bold,
      color: ColorPalette.brand.primary,
      marginBottom: 8,
    },
    learnMoreSectionText: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.black,
      lineHeight: 22,
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
      return t('Migration.DeadlinePassed', '⚠️ Migration deadline has passed. You must migrate now.')
    }
    if (daysRemaining !== null) {
      if (daysRemaining === 0) {
        return t('Migration.DeadlineToday', '⚠️ Migration deadline is today!')
      }
      if (daysRemaining === 1) {
        return t('Migration.DeadlineTomorrow', '⚠️ Migration deadline is tomorrow!')
      }
      if (daysRemaining <= 7) {
        return t('Migration.DeadlineUrgent', `⚠️ Only ${daysRemaining} days remaining until migration deadline`)
      }
      return t('Migration.DeadlineRemaining', `ℹ️ ${daysRemaining} days remaining until migration deadline`)
    }
    return null
  }

  const deadlineMessage = getDeadlineMessage()

  const handleLearnMore = () => {
    setShowLearnMore(!showLearnMore)
  }

  const handleMigrateNow = () => {
    handleAccept()
  }

  const handleRemindLater = () => {
    if (canPostpone) {
      handlePostpone()
      Alert.alert(
        t('Migration.RemindLaterTitle', 'We\'ll Remind You'),
        t('Migration.RemindLaterMessage', 'We\'ll remind you again later. You can postpone {{count}} more times.', {
          count: maxPostpones - postponeCount - 1,
        })
      )
    }
  }

  if (!showPrompt) {
    return null
  }

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>
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
              {t('Migration.BenefitsTitle', 'Why Upgrade?')}
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

          <View style={styles.learnMoreContainer}>
            <TouchableOpacity
              style={styles.learnMoreButton}
              onPress={handleLearnMore}
              accessibilityLabel={t('Migration.LearnMore', 'Learn More About Migration')}
              accessibilityRole="button"
              accessibilityState={{ expanded: showLearnMore }}
              testID={testIdWithKey('LearnMore')}
            >
              <Text style={styles.learnMoreText}>
                {showLearnMore
                  ? t('Migration.HideDetails', 'Hide Details')
                  : t('Migration.LearnMore', 'Learn More About Migration')}
              </Text>
            </TouchableOpacity>

            {showLearnMore && (
              <View style={styles.learnMoreContent}>
                <View style={styles.learnMoreSection}>
                  <Text style={styles.learnMoreSectionTitle}>
                    {t('Migration.WhatIsNewTitle', 'What\'s New?')}
                  </Text>
                  <Text style={styles.learnMoreSectionText}>
                    {t('Migration.WhatIsNewText',
                      'We\'re upgrading to a new wallet format that uses a standard 12-word recovery phrase (BIP39). This is the same technology used by major wallets worldwide, making it easier to restore your wallet on any device.')}
                  </Text>
                </View>

                <View style={styles.learnMoreSection}>
                  <Text style={styles.learnMoreSectionTitle}>
                    {t('Migration.WhyMigrateTitle', 'Why Migrate?')}
                  </Text>
                  <Text style={styles.learnMoreSectionText}>
                    {t('Migration.WhyMigrateText',
                      'The new format provides better security, easier backup and restore, and compatibility with other wallets. You\'ll be able to restore your wallet on any device using just your recovery phrase.')}
                  </Text>
                </View>

                <View style={styles.learnMoreSection}>
                  <Text style={styles.learnMoreSectionTitle}>
                    {t('Migration.WhatHappensTitle', 'What Happens During Migration?')}
                  </Text>
                  <Text style={styles.learnMoreSectionText}>
                    {t('Migration.WhatHappensText',
                      '1. We\'ll create a backup of your current wallet\n2. You\'ll receive a new 12-word recovery phrase\n3. Your existing credentials and data will be preserved\n4. The process takes about 5-10 minutes')}
                  </Text>
                </View>

                <View style={styles.learnMoreSection}>
                  <Text style={styles.learnMoreSectionTitle}>
                    {t('Migration.IsItSafeTitle', 'Is It Safe?')}
                  </Text>
                  <Text style={styles.learnMoreSectionText}>
                    {t('Migration.IsItSafeText',
                      'Yes! We create a full backup before migration. If anything goes wrong, we can restore your wallet. Your data is encrypted and never leaves your device.')}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleMigrateNow}
              accessibilityLabel={t('Migration.MigrateNow', 'Migrate Now')}
              accessibilityRole="button"
              accessibilityHint={t('Migration.MigrateNowHint', 'Start the migration process to upgrade your wallet')}
              testID={testIdWithKey('MigrateNow')}
            >
              <Text style={styles.primaryButtonText}>
                {deadlinePassed
                  ? t('Migration.MigrateNow', 'Migrate Now')
                  : t('Migration.StartUpgrade', 'Start Upgrade')}
              </Text>
            </TouchableOpacity>

            {canPostpone && (
              <TouchableOpacity
                style={[styles.secondaryButton, styles.disabledButton]}
                onPress={handleRemindLater}
                accessibilityLabel={t('Migration.RemindLater', 'Remind Me Later')}
                accessibilityRole="button"
                accessibilityHint={t('Migration.RemindLaterHint',
                  `You can postpone ${maxPostpones - postponeCount} more times before the deadline`)}
                testID={testIdWithKey('RemindLater')}
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
    </ScreenWrapper>
  )
}

export default MigrationPromptScreen
