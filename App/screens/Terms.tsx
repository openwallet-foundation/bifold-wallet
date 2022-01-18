import { useNavigation } from '@react-navigation/core'
import React, { useState, useContext } from 'react'
import { Button, SafeAreaView, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

import { useTranslation } from 'react-i18next'

import { DispatchAction } from '../Reducer'
import { Context } from '../Store'
import { Screens } from '../constants'
import { Colors, TextTheme } from '../Theme'

import { InfoTextBox, HighlightTextBox, CheckBoxRow } from 'components'
import { ScrollView } from 'react-native-gesture-handler'

const style = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundColor,
    margin: 20,
  },
  bodyText: {
    ...TextTheme.normal,
    flexShrink: 1,
    color: 'black',
  },
  controls: {
    marginTop: 15,
    backgroundColor: 'green',
  },
})

const Terms: React.FC = () => {
  const [, dispatch] = useContext(Context)
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const nav = useNavigation()

  const onSubmitPressed = () => {
    dispatch({
      type: DispatchAction.SetDidAgreeToTerms,
      payload: [{ DidAgreeToTerms: checked }],
    })

    nav.navigate(Screens.CreatePin)
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
            title={'I have read, understand and accept the terms and conditions.'}
            accessibilityLabel={t('Terms.IAgree')}
            checked={checked}
            onPress={() => setChecked(!checked)}
          />
          <Button
            title={t('Global.Submit')}
            accessibilityLabel={t('Global.Submit')}
            disabled={!checked}
            onPress={onSubmitPressed}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Terms
