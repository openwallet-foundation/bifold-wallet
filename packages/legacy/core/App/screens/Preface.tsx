import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import CheckBoxRow from '../components/inputs/CheckBoxRow'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { AuthenticateStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

const Preface: React.FC = () => {
  const [, dispatch] = useStore()
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<AuthenticateStackParams>>()
  const { Assets, OnboardingTheme, TextTheme } = useTheme()
  const onSubmitPressed = () => {
    dispatch({
      type: DispatchAction.DID_SEE_PREFACE,
    })
    navigation.navigate(Screens.Onboarding)
  }
  const style = StyleSheet.create({
    screenContainer: {
      ...OnboardingTheme.container,
      height: '100%',
      padding: 20,
      justifyContent: 'space-between',
    },

    // No properties needed, just helpful labels
    contentContainer: {},
    controlsContainer: {},
  })

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={style.screenContainer}>
          <View style={style.contentContainer}>
            <Assets.svg.preface style={{ alignSelf: 'center', marginBottom: 20 }} height={200} />
            <Text style={[TextTheme.headingTwo]}>{t('Preface.PrimaryHeading')}</Text>
            <Text style={[TextTheme.normal, { marginTop: 20, marginBottom: 20 }]}>{t('Preface.Paragraph1')}</Text>
          </View>
          <View style={style.controlsContainer}>
            <CheckBoxRow
              title={t('Preface.Confirmed')}
              accessibilityLabel={t('Terms.IAgree')}
              testID={testIdWithKey('IAgree')}
              checked={checked}
              onPress={() => setChecked(!checked)}
              reverse
              titleStyle={{ fontWeight: TextTheme.bold.fontWeight }}
            />
            <View style={[{ paddingTop: 10 }]}>
              <Button
                title={t('Global.Continue')}
                accessibilityLabel={t('Global.Continue')}
                testID={testIdWithKey('Continue')}
                disabled={!checked}
                onPress={onSubmitPressed}
                buttonType={ButtonType.Primary}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Preface
