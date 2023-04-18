import {
  AgentProvider,
  // Agent,
  TourProvider,
  CommonUtilProvider,
  AuthProvider,
  ConfigurationProvider,
  NetworkProvider,
  StoreProvider,
  ThemeProvider,
  theme,
  initLanguages,
  initStoredLanguage,
  translationResources,
  ErrorModal,
  toastConfig,
  RootStack,
  NetInfo,
  defaultConfiguration,
  TourStep,
  TourBox,
  useTour,
  useTheme,
} from 'aries-bifold'
import * as React from 'react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar, Text } from 'react-native'
import SplashScreen from 'react-native-splash-screen'
import Toast from 'react-native-toast-message'

initLanguages(translationResources)

const App = () => {
  const { t } = useTranslation()

  useMemo(() => {
    initStoredLanguage().then()
  }, [])

  useEffect(() => {
    // Hide the native splash / loading screen so that our
    // RN version can be displayed.
    SplashScreen.hide()
  }, [])

  const tourSteps: TourStep[] = [
    {
      onBackdropPress: 'stop',
      render: () => {
        const { next, stop } = useTour()
        const { ColorPallet, TextTheme } = useTheme()
        return (
          <TourBox
            title={t('Tour.AddAndShare')}
            leftText={t('Tour.Skip')}
            rightText={t('Tour.Next')}
            onLeft={stop}
            onRight={next}
          >
            <Text
              style={{
                ...TextTheme.normal,
                color: ColorPallet.notification.infoText,
              }}
            >
              {t('Tour.AddAndShareDescription')}
            </Text>
          </TourBox>
        )
      },
    },
    {
      onBackdropPress: 'stop',
      render: () => {
        const { next, previous } = useTour()
        const { ColorPallet, TextTheme } = useTheme()
        return (
          <TourBox
            title={t('Tour.Notifications')}
            leftText={t('Tour.Back')}
            rightText={t('Tour.Next')}
            onLeft={previous}
            onRight={next}
          >
            <Text
              style={{
                ...TextTheme.normal,
                color: ColorPallet.notification.infoText,
              }}
            >
              {t('Tour.NotificationsDescription')}
            </Text>
          </TourBox>
        )
      },
    },
    {
      onBackdropPress: 'stop',
      render: () => {
        const { previous, stop } = useTour()
        const { ColorPallet, TextTheme } = useTheme()
        return (
          <TourBox
            title={t('Tour.YourCredentials')}
            leftText={t('Tour.Back')}
            rightText={t('Tour.Done')}
            onLeft={previous}
            onRight={stop}
          >
            <Text
              style={{
                ...TextTheme.normal,
                color: ColorPallet.notification.infoText,
              }}
            >
              {t('Tour.YourCredentialsDescription')}
            </Text>
          </TourBox>
        )
      },
    },
  ]

  return (
    <StoreProvider>
      <AgentProvider>
        <ThemeProvider value={theme}>
          <ConfigurationProvider value={defaultConfiguration}>
            <CommonUtilProvider>
              <AuthProvider>
                <NetworkProvider>
                  <StatusBar
                    hidden={false}
                    barStyle="light-content"
                    backgroundColor={theme.ColorPallet.brand.primary}
                    translucent={false}
                  />
                  <NetInfo />
                  <ErrorModal />
                  <TourProvider steps={tourSteps} overlayColor={'gray'} overlayOpacity={0.8}>
                    <RootStack />
                  </TourProvider>
                  <Toast topOffset={15} config={toastConfig} />
                </NetworkProvider>
              </AuthProvider>
            </CommonUtilProvider>
          </ConfigurationProvider>
        </ThemeProvider>
      </AgentProvider>
    </StoreProvider>
  )
}

export default App
