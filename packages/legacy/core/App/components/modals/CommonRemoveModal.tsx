import * as React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import CredentialDeclined from '../../assets/img/credential-declined.svg'
import CustomNotificationDecline from '../../assets/img/delete-notification.svg'
import ProofDeclined from '../../assets/img/proof-declined.svg'
import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { ModalUsage } from '../../types/remove'
import { testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import UnorderedListModal from '../misc/UnorderedListModal'

interface CommonRemoveModalProps {
  usage: ModalUsage
  onSubmit?: GenericFn
  onCancel?: GenericFn
  visible?: boolean
}

interface RemoveProps {
  title: string
  content: string[]
}

interface BulletPointProps {
  text: string
  textStyle: any
}

const Dropdown: React.FC<RemoveProps> = ({ title, content }) => {
  const { TextTheme, ColorPallet } = useTheme()
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsCollapsed(!isCollapsed)}
        style={[
          {
            padding: 15,
            backgroundColor: ColorPallet.brand.modalSecondaryBackground,
            borderRadius: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
        ]}
      >
        <Text style={[TextTheme.modalNormal, { fontWeight: 'bold' }]}>{title}</Text>
        <Icon name={isCollapsed ? 'expand-more' : 'expand-less'} size={24} color={TextTheme.modalNormal.color} />
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed} enablePointerEvents={true}>
        <View
          style={[{ marginTop: 10, borderLeftWidth: 2, borderLeftColor: ColorPallet.brand.modalSecondaryBackground }]}
        >
          <UnorderedListModal UnorderedListItems={content} />
        </View>
      </Collapsible>
    </>
  )
}

const BulletPoint: React.FC<BulletPointProps> = ({ text, textStyle }) => {
  const styles = StyleSheet.create({
    iconContainer: {
      marginRight: 10,
      marginVertical: 6,
    },
  })

  return (
    <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={styles.iconContainer}>
        <Icon name={'circle'} size={9} />
      </View>
      <Text style={[textStyle, { flexShrink: 1 }]}>{text}</Text>
    </View>
  )
}

const CommonRemoveModal: React.FC<CommonRemoveModalProps> = ({ usage, visible, onSubmit, onCancel }) => {
  if (!usage) {
    throw new Error('usage cannot be undefined')
  }

  const { t } = useTranslation()
  const { ColorPallet, TextTheme } = useTheme()

  const imageDisplayOptions = {
    height: 115,
    width: 115,
  }

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
      fontSize: 18,
      fontWeight: '400',
    },
    declineBodyText: {
      ...TextTheme.modalNormal,
      fontSize: 24,
      marginTop: 25,
    },
  })

  const titleForConfirmButton = (): string => {
    if (usage === ModalUsage.ContactRemove) {
      return t('ContactDetails.RemoveContact')
    }

    if (usage === ModalUsage.CredentialRemove) {
      return t('CredentialDetails.RemoveFromWallet')
    }

    return t('Global.Remove')
  }

  const titleForAccessibilityLabel = (): string => {
    if (usage === ModalUsage.ContactRemove) {
      return t('ContactDetails.RemoveContact')
    }

    if (usage === ModalUsage.CredentialRemove) {
      return t('CredentialDetails.RemoveCredential')
    }

    return t('Global.Remove')
  }

  const headerImageForType = (usageType: ModalUsage) => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {usageType === ModalUsage.CredentialOfferDecline && <ProofDeclined {...imageDisplayOptions} />}
        {usageType === ModalUsage.ProofRequestDecline && <CredentialDeclined {...imageDisplayOptions} />}
        {usageType === ModalUsage.CustomNotificationDecline && (
          <CustomNotificationDecline style={{ marginBottom: 15 }} {...imageDisplayOptions} />
        )}
      </View>
    )
  }

  const contentForType = (type: ModalUsage) => {
    if (type === ModalUsage.CredentialOfferDecline) {
      return (
        <View style={[{ marginBottom: 25 }]}>
          <Text style={[TextTheme.modalTitle, { fontSize: 28 }]}>{t('CredentialOffer.DeclineTitle')}</Text>
          <Text style={[styles.declineBodyText, { marginTop: 30 }]}>{t('CredentialOffer.DeclineParagraph1')}</Text>
          <Text style={[styles.declineBodyText]}>{t('CredentialOffer.DeclineParagraph2')}</Text>
        </View>
      )
    }

    if (type === ModalUsage.ProofRequestDecline) {
      return (
        <View style={[{ marginBottom: 25 }]}>
          <Text style={[TextTheme.modalTitle, { fontSize: 28 }]}>{t('ProofRequest.DeclineTitle')}</Text>
          <Text style={[styles.declineBodyText, { marginTop: 30 }]}>{t('ProofRequest.DeclineBulletPoint1')}</Text>
          <Text style={[styles.declineBodyText]}>{t('ProofRequest.DeclineBulletPoint2')}</Text>
          <Text style={[styles.declineBodyText]}>{t('ProofRequest.DeclineBulletPoint3')}</Text>
        </View>
      )
    }

    if (type === ModalUsage.CustomNotificationDecline) {
      return (
        <View style={[{ marginBottom: 25 }]}>
          <Text style={[TextTheme.modalTitle, { fontSize: 28 }]}>{t('CredentialOffer.CustomOfferTitle')}</Text>
          <Text style={[styles.declineBodyText, { marginTop: 30 }]}>{t('CredentialOffer.CustomOfferParagraph1')}</Text>
          <Text style={[styles.declineBodyText]}>{t('CredentialOffer.CustomOfferParagraph2')}</Text>
        </View>
      )
    }

    if (type === ModalUsage.CredentialRemove) {
      return (
        <View>
          <View style={[{ marginBottom: 25 }]}>
            <Text style={[TextTheme.modalTitle]}>{t('CredentialDetails.RemoveTitle')}</Text>
          </View>
          <View>
            <Text style={[TextTheme.modalNormal]}>{t('CredentialDetails.RemoveCaption')}</Text>
          </View>
          <View style={{ marginTop: 25 }}>
            <Dropdown
              title={t('CredentialDetails.YouWillNotLose')}
              content={[t('CredentialDetails.YouWillNotLoseListItem1'), t('CredentialDetails.YouWillNotLoseListItem2')]}
            />
          </View>
          <View style={{ marginTop: 25 }}>
            <Dropdown
              title={t('CredentialDetails.HowToGetThisCredentialBack')}
              content={[t('CredentialDetails.HowToGetThisCredentialBackListItem1')]}
            />
          </View>
        </View>
      )
    }

    if (type === ModalUsage.ContactRemove) {
      return (
        <View>
          <View style={[{ marginBottom: 25 }]}>
            <Text style={[TextTheme.modalTitle]}>{t('ContactDetails.RemoveTitle')}</Text>
          </View>
          <View>
            <Text style={[styles.bodyText]}>{t('ContactDetails.RemoveContactMessageTop')}</Text>
            <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint1')} textStyle={styles.bodyText} />
            <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint2')} textStyle={styles.bodyText} />
            <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint3')} textStyle={styles.bodyText} />
            <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint4')} textStyle={styles.bodyText} />
            <Text style={[styles.bodyText, { marginTop: 10 }]}>{t('ContactDetails.RemoveContactMessageBottom')}</Text>
          </View>
        </View>
      )
    }

    return null
  }

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={[styles.headerView]}>
        <TouchableOpacity
          accessibilityLabel={t('Global.Close')}
          testID={testIdWithKey('Close')}
          onPress={() => onCancel && onCancel()}
          hitSlop={hitSlop}
        >
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
          {headerImageForType(usage)}
          {contentForType(usage)}
        </ScrollView>
        <View style={[styles.controlsContainer]}>
          <View style={[{ paddingTop: 10 }]}>
            <Button
              title={titleForConfirmButton()}
              accessibilityLabel={titleForAccessibilityLabel()}
              testID={testIdWithKey('ConfirmRemoveButton')}
              onPress={() => onSubmit && onSubmit()}
              buttonType={ButtonType.ModalCritical}
            />
          </View>
          <View style={[{ paddingTop: 10 }]}>
            <Button
              title={t('Global.Cancel')}
              accessibilityLabel={t('Global.Cancel')}
              testID={testIdWithKey('CancelRemoveButton')}
              onPress={() => onCancel && onCancel()}
              buttonType={ButtonType.ModalSecondary}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default CommonRemoveModal
