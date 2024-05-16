import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, ScrollView, StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

interface ProofCancelModalProps {
  visible?: boolean
  onDone?: GenericFn
}

const ProofCancelModal: React.FC<ProofCancelModalProps> = ({ visible, onDone }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme, Assets } = useTheme()

  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      flex: 1,
    },
    container: {
      flexGrow: 1,
      padding: 20,
    },
    controlsContainer: {
      marginHorizontal: 20,
      marginBottom: 10,
    },
    content: {
      justifyContent: 'space-around',
    },
    heading: {
      ...TextTheme.modalTitle,
      marginTop: 60,
      marginBottom: 30,
      textAlign: 'center',
    },
    image: {
      alignSelf: 'center',
      marginBottom: 50,
    },
    subtext: {
      ...TextTheme.modalNormal,
      textAlign: 'center',
    },
  })

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.heading}>{t('ProofRequest.NoInfoShared')}</Text>
            <Assets.svg.noInfoShared style={styles.image} height={200} />
            <Text style={styles.subtext}>{t('ProofRequest.YourInfo')}</Text>
          </View>
        </ScrollView>
        <View style={styles.controlsContainer}>
          <View style={{ paddingTop: 10 }}>
            <Button
              title={t('Global.Done')}
              accessibilityLabel={t('Global.Done')}
              testID={testIdWithKey('Done')}
              onPress={onDone}
              buttonType={ButtonType.ModalPrimary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ProofCancelModal
