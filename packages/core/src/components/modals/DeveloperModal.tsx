import React from 'react'
import { useTranslation } from 'react-i18next'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TOKENS, useServices } from '../../container-api'
import FauxHeader from '../misc/FauxHeader'
import SafeAreaModal from './SafeAreaModal'
import { useTheme } from '../../contexts/theme'

interface DeveloperModalProps {
  onBackPressed: () => void
}

const DeveloperModal: React.FC<DeveloperModalProps> = ({ onBackPressed }) => {
  const { NavigationTheme } = useTheme()
  const [Developer] = useServices([TOKENS.SCREEN_DEVELOPER])
  const { t } = useTranslation()

  return (
    <SafeAreaModal>
      <SafeAreaView
        edges={['left', 'right', 'top']}
        style={{ flex: 1, backgroundColor: NavigationTheme.colors.primary }}
      >
        <FauxHeader title={t('Screens.Developer')} onBackPressed={onBackPressed} />
        <Developer />
      </SafeAreaView>
    </SafeAreaModal>
  )
}

export default DeveloperModal
