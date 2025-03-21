import React from 'react'
import { Modal, ModalProps } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

interface SafeAreaModalProps extends ModalProps {
  children: React.ReactNode
}

const SafeAreaModal: React.FC<SafeAreaModalProps> = ({ children, ...modalProps }) => {
  return (
    <Modal {...modalProps}>
      <SafeAreaProvider>
        {children}
      </SafeAreaProvider>
    </Modal>
  )
}

export default SafeAreaModal