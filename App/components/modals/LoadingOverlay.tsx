import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, Modal } from 'react-native'

interface Props {
  visible: boolean
}

const LoadingOverlay: React.FC<Props> = ({ visible }) => {
  const { t } = useTranslation()

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.container}>
        <Text style={styles.text}>{t('Modals.loading')}</Text>
      </View>
    </Modal>
  )
}

export default LoadingOverlay

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  text: {
    fontWeight: 'bold',
    fontSize: 25,
  },
})
