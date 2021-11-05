import React from 'react'
import { useTranslation } from 'react-i18next'

import { mainColor } from '../../globalStyles'

import Message from './Message'

interface Props {
  visible: boolean
  banner?: string
  message?: string
  onPress?: () => void
}

const Success: React.FC<Props> = ({ visible, banner, message, onPress }) => {
  const { t } = useTranslation()

  return (
    <Message
      visible={visible}
      banner={banner || t('Success')}
      message={message}
      icon="check-circle"
      backgroundColor={mainColor}
      onPress={onPress}
    />
  )
}

export default Success
