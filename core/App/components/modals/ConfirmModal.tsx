import React from 'react'
import { Dimensions, StyleSheet, SafeAreaView, Modal, View, Text } from 'react-native'

import Button, { ButtonType } from '../../components/buttons/Button'
import { useTheme } from '../../contexts/theme'
import { testIdWithKey } from '../../utils/testable'

const { height } = Dimensions.get('window')

export interface props {
  title: string
  body: string
  confirm: string
  abort: string
  abortButtonStyles?: any
  confirmButtonStyles?: any
  abortSubmit?: () => void
  confirmSubmit?: () => void
}

const ConfirmModal = (props: props) => {
  const theme = useTheme()

  const styles = StyleSheet.create({
    background: {
      ...theme.ModalTheme.background,
      height: height,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    container: {
      ...theme.ModalTheme.container,
      width: '95%',
      justifyContent: 'space-evenly',
      padding: 10,
      alignItems: 'center',
      borderRadius: 10,
    },
    wrapper: {
      width: '100%',
      paddingVertical: 10,
      flexDirection: 'row',
      justifyContent: 'space-evenly',
    },
    title: {
      ...theme.ModalTheme.title,
      padding: 5,
    },
    body: {
      ...theme.ModalTheme.body,
      padding: 5,
    },
    button: {
      padding: 8,
      width: '45%',
      justifyContent: 'center',
    },
  })

  return (
    <Modal visible={true} transparent={true}>
      <SafeAreaView style={[styles.background]}>
        <View style={[styles.container]}>
          <View>
            <Text style={[styles.title]} testID={testIdWithKey('title')}>
              {props.title}
            </Text>
          </View>
          <View>
            <Text style={[styles.body]} testID={testIdWithKey('body')}>
              {props.body}
            </Text>
          </View>
          <View style={[styles.wrapper]}>
            <Button
              title={props.abort}
              testID={testIdWithKey('abort')}
              accessibilityLabel={'abort'}
              buttonType={ButtonType.Secondary}
              onPress={props.abortSubmit}
              styles={props.abortButtonStyles ? [styles.button, ...props.abortButtonStyles] : [styles.button]}
            />
            <Button
              title={props.confirm}
              testID={testIdWithKey('confirm')}
              accessibilityLabel={'confirm'}
              buttonType={ButtonType.Primary}
              onPress={props.confirmSubmit}
              styles={props.confirmButtonStyles ? [styles.button, ...props.confirmButtonStyles] : [styles.button]}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ConfirmModal
