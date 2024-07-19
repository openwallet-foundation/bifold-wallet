import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { ButtonType } from '../components/buttons/Button-api'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import HighlightTextBox from '../components/texts/HighlightTextBox'
import InfoTextBox from '../components/texts/InfoTextBox'
import { TOKENS, useContainer } from '../container-api'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

export const TermsVersion = true

const Terms: React.FC = () => {
  const [store, dispatch] = useStore()
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const { OnboardingTheme, TextTheme } = useTheme()
  const container = useContainer()
  const Button = container.resolve(TOKENS.COMP_BUTTON)
  const agreedToPreviousTerms = store.onboarding.didAgreeToTerms
  const onSubmitPressed = useCallback(() => {
    dispatch({
      type: DispatchAction.DID_AGREE_TO_TERMS,
      payload: [{ DidAgreeToTerms: TermsVersion }],
    })

    if (!agreedToPreviousTerms) {
      navigation.navigate(Screens.CreatePIN)
    } else if (store.onboarding.postAuthScreens.length) {
      const screens: string[] = store.onboarding.postAuthScreens
      screens.shift()
      dispatch({ type: DispatchAction.SET_POST_AUTH_SCREENS, payload: [screens] })
      if (screens.length) {
        navigation.navigate(screens[0] as never)
      } else {
        dispatch({ type: DispatchAction.DID_COMPLETE_ONBOARDING, payload: [true] })
      }
    }
  }, [])
  const style = StyleSheet.create({
    container: {
      ...OnboardingTheme.container,
      padding: 20,
    },
    bodyText: {
      ...OnboardingTheme.bodyText,
      flexShrink: 1,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginBottom: 20,
    },
  })
  const onBackPressed = () => {
    //TODO:(jl) goBack() does not unwind the navigation stack but rather goes
    //back to the splash screen. Needs fixing before the following code will
    //work as expected.

    // if (nav.canGoBack()) {
    //   nav.goBack()
    // }

    navigation.navigate(Screens.Onboarding)
  }

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']}>
      <ScrollView style={[style.container]}>
        <InfoTextBox>Please agree to the terms and conditions below before using this application.</InfoTextBox>
        <Text style={[style.bodyText, { marginTop: 20, marginBottom: 20 }]}>
          <Text style={[style.bodyText, { fontWeight: TextTheme.bold.fontWeight }]}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Text>{' '}
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
          in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
          proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </Text>
        <HighlightTextBox>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui</HighlightTextBox>
        <Text style={[style.bodyText, { marginTop: 20 }]}>
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
          exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit
          in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Tempor incididunt ut labore et dolore magna
          aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
          consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
          pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
          est laborum.
        </Text>
        <View style={[style.controlsContainer]}>
          {!agreedToPreviousTerms && (
            <CheckBoxRow
              title={t('Terms.Attestation')}
              accessibilityLabel={t('Terms.IAgree')}
              testID={testIdWithKey('IAgree')}
              checked={checked}
              onPress={() => setChecked(!checked)}
            />
          )}
          <View style={[{ paddingTop: 10 }]}>
            <Button
              title={agreedToPreviousTerms ? t('Global.Accept') : t('Global.Continue')}
              accessibilityLabel={agreedToPreviousTerms ? t('Global.Accept') : t('Global.Continue')}
              testID={agreedToPreviousTerms ? testIdWithKey('Accept') : testIdWithKey('Continue')}
              disabled={!checked && !agreedToPreviousTerms}
              onPress={onSubmitPressed}
              buttonType={ButtonType.Primary}
            />
          </View>
          {!agreedToPreviousTerms && (
            <View style={[{ paddingTop: 10, marginBottom: 20 }]}>
              <Button
                title={t('Global.Back')}
                accessibilityLabel={t('Global.Back')}
                testID={testIdWithKey('Back')}
                onPress={onBackPressed}
                buttonType={ButtonType.Secondary}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Terms
