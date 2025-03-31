import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View, Platform, Linking } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import Link from '../components/texts/Link'
import { ThemedText } from '../components/texts/ThemedText'
import { useTheme } from '../contexts/theme'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'

type UpdateAvailableProps = {
  appleAppStoreUrl?: string
  googlePlayStoreUrl?: string
}

const UpdateAvailable: React.FC<UpdateAvailableProps> = ({ appleAppStoreUrl, googlePlayStoreUrl }) => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const { ColorPallet, Assets, Spacing } = useTheme()
  const [logger] = useServices([TOKENS.UTIL_LOGGER])

  // Check if both store links are available
  const hasStoreLinks = Boolean(appleAppStoreUrl && googlePlayStoreUrl)

  const onPressWhatIsNew = useCallback(() => {
    const url = Platform.OS === 'ios' ? appleAppStoreUrl : googlePlayStoreUrl
    if (url) {
      Linking.openURL(url).catch((err) => logger.error('Failed to open app store link', err))
    }
  }, [appleAppStoreUrl, googlePlayStoreUrl, logger])

  const onPressLater = useCallback(() => {
    dispatch({
      type: DispatchAction.SET_VERSION_INFO,
      payload: [{ dismissed: true }],
    })
  }, [dispatch])

  const iconOptions = {
    fill: ColorPallet.notification.infoText,
    height: 130,
    width: 130,
  }

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: 20,
    },
    image: {
      marginTop: 20,
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: 24,
    },
    messageText: {
      textAlign: 'center',
      marginTop: 30,
    },
    controlsContainer: {
      marginTop: 'auto',
      margin: 20,
    },
    delayMessageText: {
      textAlign: 'center',
      marginTop: 20,
    },
    buttonContainer: {
      justifyContent: 'flex-end',
      flex: 1,
    },
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.imageContainer}>
          <Assets.svg.updateAvailable {...iconOptions} />
        </View>
        <ThemedText variant="headingTwo" style={{ marginBottom: Spacing.lg }}>{t('AppUpdate.Heading')}</ThemedText>
        <ThemedText>{t('AppUpdate.Body')}</ThemedText>

        {hasStoreLinks && (
          <Link style={{ marginVertical: 24 }} onPress={onPressWhatIsNew} linkText={t('AppUpdate.LearnMore')} />
        )}

        <View style={styles.buttonContainer}>
          {hasStoreLinks && (
            <View style={{ marginBottom: 15 }}>
              <Button
                title={t('AppUpdate.UpdateNow')}
                accessibilityLabel={t('AppUpdate.UpdateNow')}
                testID={testIdWithKey('UpdateNow')}
                buttonType={ButtonType.Primary}
                onPress={onPressWhatIsNew}
              />
            </View>
          )}
          <Button
            title={t('AppUpdate.UpdateLater')}
            accessibilityLabel={t('AppUpdate.UpdateLater')}
            testID={testIdWithKey('UpdateLater')}
            buttonType={ButtonType.Secondary}
            onPress={onPressLater}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default UpdateAvailable
