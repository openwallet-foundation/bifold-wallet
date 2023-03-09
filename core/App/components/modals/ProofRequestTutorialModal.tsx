import React, { useEffect, useState } from 'react'
import { Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import { ColorPallet } from '../../theme'

interface ProofRequestTutorialModalProps {
  visible: boolean
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: ColorPallet.brand.modalSecondaryBackground,
  },
  title: {
    fontWeight: 'bold',
    color: ColorPallet.grayscale.white,
    marginBottom: 16,
  },
  image: {
    width: 350,
    height: 200,
    marginBottom: 16,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  buttonText: {
    color: ColorPallet.brand.primary,
  },
  closeButton: {
    width: 50,
    height: 50,
  },
  closeButtonIcon: {
    color: ColorPallet.grayscale.white,
  },
})

const ProofRequestTutorialModal: React.FC<ProofRequestTutorialModalProps> = ({ visible }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(true)

  useEffect(() => {
    if (visible !== undefined) {
      setModalVisible(visible)
    }
  }, [visible])

  const close = () => {
    setModalVisible(false)
  }

  return (
    <Modal visible={modalVisible} transparent={true}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <View style={styles.container}>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}
          >
            <View style={{ paddingTop: 24 }}>
              <Text style={styles.title} numberOfLines={2}>
                Show this QR code to the person
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton}>
              <Icon name="close" size={35} style={styles.closeButtonIcon} />
            </TouchableOpacity>
          </View>

          <Image source={{ uri: 'https://reactjs.org/logo-og.png' }} style={styles.image} />
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.title} numberOfLines={3}>
              You will connect with the other person. They will receive a proof request.
            </Text>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Skip</Text>
            </TouchableOpacity>
            <View>
              <Text style={{ color: '#fff' }}>Pagination</Text>
            </View>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ProofRequestTutorialModal
