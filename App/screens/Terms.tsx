import type { StackNavigationProp } from '@react-navigation/stack'
import type { AuthenticateStackParams } from 'navigators/AuthenticateStack'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SafeAreaScrollView, Button, AppHeaderLarge, ModularView, CheckBoxRow } from 'components'

interface Props {
  navigation: StackNavigationProp<AuthenticateStackParams, 'Terms & Conditions'>
}

const Terms: React.FC<Props> = ({ navigation }) => {
  const [checked, setChecked] = useState(false)
  const { t } = useTranslation()

  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <ModularView title={t('Terms.terms_of_service')} content={t('Terms.terms_of_service_text')} />
      <CheckBoxRow title={t('Terms.i_agree')} checked={checked} onPress={() => setChecked(!checked)} />
      <Button title={t('Global.submit')} disabled={!checked} onPress={() => navigation.navigate('Create 6-Digit Pin')} />
    </SafeAreaScrollView>
  )
}

export default Terms
