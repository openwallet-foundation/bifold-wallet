import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native'

import { ButtonType } from '../components/buttons/Button'
import { Context } from '../store/Store'
import { DispatchAction } from '../store/reducer'
import { Colors, TextTheme } from '../theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'

import { Button, CheckBoxRow } from 'components'
import HighlightTextBox from 'components/texts/HighlightTextBox'
import InfoTextBox from 'components/texts/InfoTextBox'

const style = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    margin: 20,
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
  },
  controls: {
    marginTop: 15,
  },
})

const Terms: React.FC = () => {
  const [, dispatch] = useContext(Context)
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()

  const onSubmitPressed = () => {
    dispatch({
      type: DispatchAction.SetDidAgreeToTerms,
      payload: [{ DidAgreeToTerms: checked }],
    })

    navigation.navigate(Screens.CreatePin)
  }

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
    <SafeAreaView style={[style.container]}>
      <ScrollView>
        <InfoTextBox>Please agree to the terms and conditions below before using this application.</InfoTextBox>
        <Text style={[style.bodyText, { marginTop: 20, marginBottom: 20 }]}>
          <Text style={[style.bodyText, { fontWeight: 'bold' }]}>
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
        <View style={[style.controls]}>
          <CheckBoxRow
            title={t('Terms.Attestation')}
            accessibilityLabel={t('Terms.IAgree')}
            checked={checked}
            onPress={() => setChecked(!checked)}
          />
          <View style={[{ paddingTop: 10 }]}>
            <Button
              title={t('Global.Continue')}
              accessibilityLabel={t('Global.Continue')}
              disabled={!checked}
              onPress={onSubmitPressed}
              buttonType={ButtonType.Primary}
            />
          </View>
          <View style={[{ paddingTop: 10 }]}>
            <Button
              title={t('Global.Back')}
              accessibilityLabel={t('Global.Back')}
              onPress={onBackPressed}
              buttonType={ButtonType.Secondary}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Terms
