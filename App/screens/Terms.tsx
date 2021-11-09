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
      <ModularView title={t('Terms of Service')} content={t('Terms of Service Text')} />
      <CheckBoxRow title={t('I Agree')} checked={checked} onPress={() => setChecked(!checked)} />
      <Button title={t('Submit')} disabled={!checked} onPress={() => navigation.navigate('Create 6-Digit Pin')} />
    </SafeAreaScrollView>
  )
}

export default Terms
