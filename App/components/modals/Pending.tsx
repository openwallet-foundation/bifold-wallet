import React from 'react'

import Message from './Message'

import { backgroundColor } from '../../globalStyles'

interface Props {
  visible: boolean
  message?: string
  onPress?: () => void
}

const Pending: React.FC<Props> = ({ visible, message, onPress }) => {
  return (
    <Message
      visible={visible}
      banner="Pending"
      message={message}
      icon="alarm"
      backgroundColor={backgroundColor}
      onPress={onPress}
    />
  )
}

export default Pending
