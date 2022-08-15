import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, StyleSheet, SafeAreaView, Modal } from 'react-native'

import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'
import WarningBox from '../misc/WarningBox'

const { height } = Dimensions.get('window')

export interface props {
  title?: string
  body?: string
  confirm?: string
  abort?: string
  submit?: () => void
}

const ConfirmModal = (props: props) => {
  const { modal, setModal } = useState()
  const theme = useTheme()

  const styles = StyleSheet.create({
    background: { ...theme.ModalTheme.background, height: height },
  })

  return (
    <Modal visible={true} transparent={true}>
      <SafeAreaView style={[styles.background]}>
        <WarningBox
          title={props.title}
          body={props.body}
          abort={props.abort}
          confirm={props.confirm}
          submit={props.submit}
        />
      </SafeAreaView>
    </Modal>
  )
}

export default ConfirmModal
