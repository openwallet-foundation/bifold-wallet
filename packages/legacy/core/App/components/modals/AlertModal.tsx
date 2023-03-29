import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { InfoBoxType } from '../../components/misc/InfoBox'

import PopupModal from './PopupModal'

const { height } = Dimensions.get('window')

interface AlertModalProps {
  title: string
  message: string
  submit?: () => void
}

const AlertModal: React.FC<AlertModalProps> = ({ title, message, submit }) => {
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    container: {
      minHeight: height,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  return (
    <SafeAreaView style={[styles.container]}>
      <PopupModal
        notificationType={InfoBoxType.Info}
        title={title}
        description={message}
        onCallToActionLabel={t('Global.Okay')}
        onCallToActionPressed={submit ? () => submit() : () => undefined}
      ></PopupModal>
    </SafeAreaView>
  )
}

export default AlertModal
