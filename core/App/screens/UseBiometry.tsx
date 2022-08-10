import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import { useAuth } from '../contexts/auth'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { testIdWithKey } from '../utils/testable'

const UseBiometry: React.FC = () => {
  const [, dispatch] = useStore()
  const { convertToUseBiometrics } = useAuth()
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: ColorPallet.brand.primaryBackground,
    },
  })

  const didAcceptBiometryUse = async () => {
    await convertToUseBiometrics()

    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [true],
    })
  }

  const didDeclineBiometryUse = () => {
    dispatch({
      type: DispatchAction.USE_BIOMETRY,
      payload: [false],
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button
        title={'Yes'}
        accessibilityLabel={'Yes'}
        testID={testIdWithKey('Yes')}
        onPress={didAcceptBiometryUse}
        buttonType={ButtonType.Primary}
      />
      <Button
        title={'No?'}
        accessibilityLabel={'NO'}
        testID={testIdWithKey('No')}
        onPress={didDeclineBiometryUse}
        buttonType={ButtonType.Secondary}
      />
    </SafeAreaView>
  )
}

export default UseBiometry
