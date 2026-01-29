import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { OnboardingStackParams, Screens } from '../types/navigators'

const OnboardingWelcomeScreen: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<OnboardingStackParams>>()
  const { ColorPalette, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: ColorPalette.brand.primaryBackground,
    },
    scrollView: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 40,
    },
    logoContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    logo: {
      width: 120,
      height: 120,
      marginBottom: 24,
    },
    title: {
      ...TextTheme.headingOne,
      color: ColorPalette.brand.primary,
      textAlign: 'center',
      marginBottom: 16,
    },
    subtitle: {
      ...TextTheme.normal,
      color: ColorPalette.grayscale.mediumGrey,
      textAlign: 'center',
      marginBottom: 48,
      lineHeight: 24,
    },
    buttonContainer: {
      width: '100%',
      gap: 16,
    },
  })

  const handleCreateWallet = () => {
    navigation.navigate(Screens.CreateWallet)
  }

  const handleRestoreWallet = () => {
    navigation.navigate(Screens.RestoreWalletOnboarding)
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.logoContainer}>
          {/* Logo placeholder - replace with actual logo */}
          <View
            style={[
              styles.logo,
              {
                backgroundColor: ColorPalette.brand.primary,
                borderRadius: 60,
                justifyContent: 'center',
                alignItems: 'center',
              },
            ]}
          >
            <Text style={{ fontSize: 48, color: ColorPalette.grayscale.white }}>🔐</Text>
          </View>
          <Text style={styles.title}>{t('OnboardingWelcome.Title') as string}</Text>
          <Text style={styles.subtitle}>{t('OnboardingWelcome.Subtitle') as string}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t('OnboardingWelcome.CreateNewWallet') as string}
            accessibilityLabel={t('OnboardingWelcome.CreateNewWallet') as string}
            testID="CreateNewWalletButton"
            buttonType={ButtonType.Primary}
            onPress={handleCreateWallet}
          />
          <Button
            title={t('OnboardingWelcome.RestoreWallet') as string}
            accessibilityLabel={t('OnboardingWelcome.RestoreWallet') as string}
            testID="RestoreWalletButton"
            buttonType={ButtonType.Secondary}
            onPress={handleRestoreWallet}
          />
        </View>
      </ScrollView>
    </View>
  )
}

export default OnboardingWelcomeScreen
