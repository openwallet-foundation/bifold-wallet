import React from 'react'
import { useTranslation } from 'react-i18next'

import { SafeAreaScrollView, Label } from 'components'

const Settings: React.FC = () => {
  const { t } = useTranslation()

  return (
    <SafeAreaScrollView>
      <Label title={t('Version')} subtitle={t('Version String')} />
      <Label title={t('AMA-RN Version')} subtitle={t('AMA-RN Version String')} />
    </SafeAreaScrollView>
  )
}

export default Settings
