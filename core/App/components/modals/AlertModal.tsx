import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Modal, SafeAreaView, StyleSheet } from 'react-native'

import InfoBox, { InfoBoxType } from '../../components/misc/InfoBox'

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
    <Modal visible={true} transparent={true}>
      <SafeAreaView style={[styles.container]}>
        <InfoBox
          notificationType={InfoBoxType.Info}
          title={title}
          description={message}
          onCallToActionLabel={t('Global.Okay')}
          onCallToActionPressed={submit ? () => submit() : () => undefined}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default AlertModal
