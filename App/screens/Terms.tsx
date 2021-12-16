import { useNavigation } from '@react-navigation/core'
import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import { DispatchAction } from '../Reducer'
import { Context } from '../Store'
import { Screens } from '../constants'

import { SafeAreaScrollView, Button, AppHeaderLarge, ModularView, CheckBoxRow } from 'components'

// interface Props {
//   navigation: StackNavigationProp<AuthenticateStackParams, 'Terms & Conditions'>
// }

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
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <ModularView title={t('Terms.TermsOfService')} content={t('Terms.TermsOfServiceText')} />
      <CheckBoxRow
        title={t('Terms.IAgree')}
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
    </SafeAreaScrollView>
  )
}

export default Terms
