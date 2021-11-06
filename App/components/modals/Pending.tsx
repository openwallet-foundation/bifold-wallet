import React from 'react'

import Message from './Message'

import { backgroundColor } from '../../globalStyles'
import { useTranslation } from 'react-i18next'

interface Props {
  visible: boolean
  banner?: string
  message?: string
  onPress?: () => void
}

const Pending: React.FC<Props> = ({ visible, banner, message, onPress }) => {
  const { t } = useTranslation()

  return (
    <Message
      visible={visible}
      banner={banner || t('Modals.pending')}
      message={message || ''}
      icon="alarm"
      backgroundColor={backgroundColor}
      onPress={onPress}
    />
  )
}

export default Pending
