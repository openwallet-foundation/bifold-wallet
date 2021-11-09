import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet, Modal } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialIcons'

import Button from '../buttons/Button'
import Text from '../texts/Text'
import Title from '../texts/Title'

interface Props {
  icon: string
  banner: string
  message?: string
  backgroundColor: string
  visible: boolean
  onPress?: () => void
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
})

const Message: React.FC<Props> = ({ icon, banner, message, backgroundColor, visible, onPress }) => {
  const { t } = useTranslation()

  return (
    <Modal visible={visible} animationType="fade">
      <View style={[styles.container, { backgroundColor }]}>
        <View style={{ alignItems: 'center' }}>
          <Icon name={icon} color={'white'} size={160} />
          <Title>{banner}</Title>
          <Text style={{ textAlign: 'center', margin: 15 }}>{message}</Text>
        </View>
        {onPress && <Button title={t('Close')} neutral onPress={onPress} />}
      </View>
    </Modal>
  )
}

export default Message
