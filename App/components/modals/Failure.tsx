import React from 'react'
import { useTranslation } from 'react-i18next'

import Message from './Message'

interface Props {
  visible: boolean
  message?: string
  onPress?: () => void
}

const Failure: React.FC<Props> = ({ visible, message, onPress }) => {
  const { t } = useTranslation()

  return (
    <Message
      visible={visible}
      banner={t('Failure')}
      message={message}
      icon="cancel"
      backgroundColor="#de3333"
      onPress={onPress}
    />
  )
}

export default Failure
