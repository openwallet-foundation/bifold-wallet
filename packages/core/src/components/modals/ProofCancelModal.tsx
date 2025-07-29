import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import { ThemedText } from '../texts/ThemedText'
import SafeAreaModal from './SafeAreaModal'

interface ProofCancelModalProps {
  visible?: boolean
  onDone?: GenericFn
}

const ProofCancelModal: React.FC<ProofCancelModalProps> = ({ visible, onDone }) => {
  const { t } = useTranslation()
  const { ColorPalette, Assets } = useTheme()

  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: ColorPalette.brand.modalPrimaryBackground,
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
      marginTop: 60,
      marginBottom: 30,
      textAlign: 'center',
    },
    image: {
      alignSelf: 'center',
      marginBottom: 50,
    },
  })

  return (
    <SafeAreaModal visible={visible} animationType="slide">
      <SafeAreaView style={styles.safeAreaView}>
        <ScrollView style={styles.container}>
          <View style={styles.content}>
            <ThemedText variant="modalTitle" style={styles.heading}>
              {t('ProofRequest.NoInfoShared')}
            </ThemedText>
            <Assets.svg.noInfoShared style={styles.image} height={200} />
            <ThemedText variant="modalNormal" style={{ textAlign: 'center' }}>
              {t('ProofRequest.YourInfo')}
            </ThemedText>
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
    </SafeAreaModal>
  )
}

export default ProofCancelModal
