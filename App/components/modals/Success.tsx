import React from 'react'

import Message from './Message'

import { mainColor } from '../../globalStyles'

interface Props {
  visible: boolean
  message?: string
  onPress?: () => void
}

const Success: React.FC<Props> = ({ visible, message, onPress }) => {
  return (
    <Message
      visible={visible}
      banner="Success"
      message={message}
      icon="check-circle"
      backgroundColor={mainColor}
      onPress={onPress}
    />
  )
}

export default Success
