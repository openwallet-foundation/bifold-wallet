import React from 'react'
import { Modal, StyleSheet, View } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import InfoBox, { InfoBoxType } from '../misc/InfoBox'

interface PopupModalProps {
  notificationType: InfoBoxType
  title: string
  description?: string
  message?: string
  bodyContent?: Element
  onCallToActionPressed?: GenericFn
  onCallToActionLabel: string
}

const PopupModal: React.FC<PopupModalProps> = ({
  title,
  bodyContent,
  description,
  message,
  onCallToActionPressed,
  notificationType,
  onCallToActionLabel,
}) => {
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.notification.popupOverlay,
      padding: 20,
    },
  })

  return (
    <Modal transparent>
      <View style={styles.modalCenter}>
        <InfoBox
          notificationType={notificationType}
          title={title}
          description={description}
          message={message}
          bodyContent={bodyContent}
          onCallToActionLabel={onCallToActionLabel}
          onCallToActionPressed={onCallToActionPressed}
        />
      </View>
    </Modal>
  )
}

export default PopupModal
