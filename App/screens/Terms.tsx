import React, { useState } from 'react'

import { SafeAreaScrollView, Button, AppHeaderLarge, ModularView, CheckBoxRow } from 'components'
import { useTranslation } from 'react-i18next'

interface Props {
  navigation: any
}

const Terms: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation()

  const mockTitle = t('Terms.termsOfService')
  const mockMessage = t('Terms.termsOfServiceText')

  const [checked, setChecked] = useState(false)

  return (
    <SafeAreaScrollView>
      <AppHeaderLarge />
      <ModularView title={mockTitle} content={mockMessage} />
      <CheckBoxRow
        title={t('Terms.iAgreeToTheTermsOfService')}
        checked={checked}
        onPress={() => setChecked(!checked)}
      />
      <Button title={t('Terms.submit')} disabled={!checked} onPress={() => navigation.navigate('Create 6-Digit Pin')} />
    </SafeAreaScrollView>
  )
}

export default Terms
