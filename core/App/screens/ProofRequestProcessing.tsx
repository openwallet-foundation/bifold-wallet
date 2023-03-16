import { useProofById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, Modal, StatusBar, StyleSheet, Text, View, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import SendingProof from '../components/animated/SendingProof'
import Button, { ButtonType } from '../components/buttons/Button'
import { useTheme } from '../contexts/theme'
import { Screens, TabStacks } from '../types/navigators'
import { statusBarStyleForColor, StatusBarStyles } from '../utils/luminance'
import { testIdWithKey } from '../utils/testable'

export interface ProofRequestAcceptProps {
  visible: boolean
  proofId: string
}

const ProofRequestAccept: React.FC<ProofRequestAcceptProps> = ({ visible, proofId }) => {
  const { t } = useTranslation()
  const proof = useProofById(proofId)
  const navigation = useNavigation()
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.primaryBackground,
      padding: 20,
    },
    image: {
      marginTop: 20,
    },
    messageContainer: {
      alignItems: 'center',
    },
    messageText: {
      fontWeight: 'normal',
      textAlign: 'center',
      marginTop: 30,
    },
    controlsContainer: {
      marginTop: 'auto',
      margin: 20,
    },
  })

  const onBackToHomeTouched = () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  return (
    <Modal visible={visible} transparent={true} animationType={'none'}>
      <StatusBar
        barStyle={
          Platform.OS === 'android' ? StatusBarStyles.Light : statusBarStyleForColor(styles.container.backgroundColor)
        }
      />
      <SafeAreaView style={{ backgroundColor: ColorPallet.brand.primaryBackground }}>
        <ScrollView style={[styles.container]}>
          <View style={[styles.messageContainer]}>
            <Text style={[TextTheme.headingThree, styles.messageText]} testID={testIdWithKey('SentProofRequest')}>
              {t('ProofRequest.RequestProcessing')}
            </Text>
          </View>

          <View style={[styles.image, { minHeight: 250, alignItems: 'center', justifyContent: 'flex-end' }]}>
            <SendingProof />
          </View>
        </ScrollView>

        <View style={[styles.controlsContainer]}>
          <View>
            <Button
              title={t('Loading.BackToHome')}
              accessibilityLabel={t('Loading.BackToHome')}
              testID={testIdWithKey('BackToHome')}
              onPress={onBackToHomeTouched}
              buttonType={ButtonType.Secondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default ProofRequestAccept
