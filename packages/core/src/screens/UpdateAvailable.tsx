import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Platform, Linking } from 'react-native'

import Button, { ButtonType } from '../components/buttons/Button'
import Link from '../components/texts/Link'
import { ThemedText } from '../components/texts/ThemedText'
import { useTheme } from '../contexts/theme'
import { useStore } from '../contexts/store'
import { DispatchAction } from '../contexts/reducers/store'
import { testIdWithKey } from '../utils/testable'
import { TOKENS, useServices } from '../container-api'
import ScreenWrapper from '../components/views/ScreenWrapper'

type UpdateAvailableProps = {
  appleAppStoreUrl?: string
  googlePlayStoreUrl?: string
}

const UpdateAvailable: React.FC<UpdateAvailableProps> = ({ appleAppStoreUrl, googlePlayStoreUrl }) => {
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const { ColorPalette, Assets, Spacing } = useTheme()
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
    fill: ColorPalette.notification.infoText,
    height: 130,
    width: 130,
  }

  const styles = StyleSheet.create({
    image: {
      marginTop: Spacing.md,
    },
    imageContainer: {
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    messageText: {
      textAlign: 'center',
      marginTop: Spacing.lg,
    },
    delayMessageText: {
      textAlign: 'center',
      marginTop: Spacing.md,
    },
  })

  const controls = (
    <>
      {hasStoreLinks && (
        <Button
          title={t('AppUpdate.UpdateNow')}
          accessibilityLabel={t('AppUpdate.UpdateNow')}
          testID={testIdWithKey('UpdateNow')}
          buttonType={ButtonType.Primary}
          onPress={onPressWhatIsNew}
        />
      )}
      <Button
        title={t('AppUpdate.UpdateLater')}
        accessibilityLabel={t('AppUpdate.UpdateLater')}
        testID={testIdWithKey('UpdateLater')}
        buttonType={ButtonType.Secondary}
        onPress={onPressLater}
      />
    </>
  )

  return (
    <ScreenWrapper controls={controls} padded>
      <View style={styles.imageContainer}>
        <Assets.svg.updateAvailable {...iconOptions} />
      </View>
      <ThemedText variant="headingTwo" style={{ marginBottom: Spacing.lg }}>
        {t('AppUpdate.Heading')}
      </ThemedText>
      <ThemedText>{t('AppUpdate.Body')}</ThemedText>

      {hasStoreLinks && (
        <Link style={{ marginVertical: Spacing.lg }} onPress={onPressWhatIsNew} linkText={t('AppUpdate.LearnMore')} />
      )}
    </ScreenWrapper>
  )
}

export default UpdateAvailable
