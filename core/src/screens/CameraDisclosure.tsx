import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import { useTheme } from '../contexts/theme'
import { GenericFn } from '../types/fn'

interface CameraDisclosureProps {
  didDismissCameraDisclosure: GenericFn
}

const CameraDisclosure: React.FC<CameraDisclosureProps> = ({ didDismissCameraDisclosure }) => {
  const { t } = useTranslation()
  const { ColorPallet } = useTheme()

  const styles = StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: ColorPallet.brand.primary,
      paddingHorizontal: 25,
    },
  })

  return (
    <SafeAreaView style={[styles.container]}>
      <InfoBox
        notificationType={InfoBoxType.Info}
        title={t('PrivacyPolicy.Title')}
        description={t('PrivacyPolicy.CameraDisclosure')}
        onCallToActionLabel={t('Global.Okay')}
        onCallToActionPressed={() => didDismissCameraDisclosure()}
      />
    </SafeAreaView>
  )
}

export default CameraDisclosure
