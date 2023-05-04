import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
// import { RemoveType } from '../../types/remove'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'

export enum DeclineType {
  CredentialOffer,
  ProofRequest,
}

interface CommonDeclineModalProps {
  removeType: DeclineType
  onSubmit?: GenericFn
  onCancel?: GenericFn
  visible?: boolean
}

const CommonDeclineModal: React.FC<CommonDeclineModalProps> = ({ removeType, visible, onSubmit, onCancel }) => {
  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()

  const styles = StyleSheet.create({
    container: {
      height: '100%',
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      padding: 20,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginHorizontal: 20,
      marginBottom: Platform.OS === 'ios' ? 108 : 20,
    },
    headerView: {
      alignItems: 'flex-end',
      marginTop: 65,
      backgroundColor: ColorPallet.brand.modalPrimaryBackground,
      height: 55,
      paddingTop: 10,
      paddingRight: 20,
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
    },
    bodyText: {
      ...TextTheme.modalNormal,
      fontSize: 24,
      marginTop: 25,
    },
  })

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={[styles.headerView]}>
        <TouchableOpacity accessibilityLabel="Close" testID="Close" onPress={() => onCancel && onCancel()}>
          <Icon name={'close'} size={42} color={TextTheme.modalNormal.color} />
        </TouchableOpacity>
      </View>
      <SafeAreaView
        edges={['left', 'right', 'bottom']}
        style={[
          {
            backgroundColor: ColorPallet.brand.modalPrimaryBackground,
          },
        ]}
      >
        <ScrollView style={[styles.container]}>
          {removeType === DeclineType.ProofRequest && (
            <View>
              <View style={[{ marginBottom: 25 }]}>
                <Text style={[TextTheme.modalTitle, { fontSize: 28 }]}>{t('ProofRequest.DeclineTitle')}</Text>
                <Text style={[styles.bodyText, { marginTop: 30 }]}>{t('ProofRequest.DeclineBulletPoint1')}</Text>
                <Text style={[styles.bodyText]}>{t('ProofRequest.DeclineBulletPoint2')}</Text>
                <Text style={[styles.bodyText]}>{t('ProofRequest.DeclineBulletPoint3')}</Text>
              </View>
            </View>
          )}
          {removeType === DeclineType.CredentialOffer && (
            <View>
              <View style={[{ marginBottom: 25 }]}>
                <Text style={[TextTheme.modalTitle, { fontSize: 28 }]}>{t('CredentialOffer.DeclineTitle')}</Text>
                <Text style={[styles.bodyText, { marginTop: 30 }]}>{t('CredentialOffer.DeclineBulletPoint1')}</Text>
                <Text style={[styles.bodyText]}>{t('CredentialOffer.DeclineBulletPoint2')}</Text>
              </View>
            </View>
          )}
        </ScrollView>
        <View style={[styles.controlsContainer]}>
          <View style={[{ paddingTop: 10 }]}>
            <Button
              title={t('Global.Decline')}
              accessibilityLabel={t('Global.Decline')}
              testID={testIdWithKey('ConfirmDeclineButton')}
              onPress={() => onSubmit && onSubmit()}
              buttonType={ButtonType.ModalCritical}
            />
          </View>
          <View style={[{ paddingTop: 10 }]}>
            <Button
              title={t('Global.Cancel')}
              accessibilityLabel={t('Global.Cancel')}
              testID={testIdWithKey('CancelDeclineButton')}
              onPress={() => onCancel && onCancel()}
              buttonType={ButtonType.ModalSecondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default CommonDeclineModal
