import React from 'react'
import { useTranslation } from 'react-i18next'

import { SafeAreaScrollView, Label } from 'components'

const Settings: React.FC = () => {
  const { t } = useTranslation()

  return (
    <SafeAreaScrollView>
      <Label title={t('Settings.Version')} subtitle={t('Settings.Version String')} />
      <Label title={t('Settings.AMA-RN Version')} subtitle={t('Settings.AMA-RN Version String')} />
    </SafeAreaScrollView>
  )
}

export default Settings
