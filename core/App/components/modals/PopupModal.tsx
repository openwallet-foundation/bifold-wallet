import React from 'react'
import { Modal, StyleSheet, View } from 'react-native'

import { GenericFn } from '../../types/fn'
import InfoBox, { InfoBoxType } from '../misc/InfoBox'

interface PopupModalProps {
  notificationType: InfoBoxType
  title: string
  bodyContent?: Element
  onCallToActionPressed?: GenericFn
  onCallToActionLabel: string
}

const PopupModal: React.FC<PopupModalProps> = ({
  title,
  bodyContent,
  onCallToActionPressed,
  notificationType,
  onCallToActionLabel,
}) => {
  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 20,
    },
  })

  return (
    <Modal transparent>
      <View style={styles.modalCenter}>
        <InfoBox
          notificationType={notificationType}
          title={title}
          bodyContent={bodyContent}
          onCallToActionLabel={onCallToActionLabel}
          onCallToActionPressed={onCallToActionPressed}
        />
      </View>
    </Modal>
  )
}

export default PopupModal
