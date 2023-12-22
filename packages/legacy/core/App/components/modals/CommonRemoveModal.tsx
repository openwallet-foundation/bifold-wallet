import * as React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { ModalUsage } from '../../types/remove'
import { testIdForAccessabilityLabel, testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import ContentGradient from '../misc/ContentGradient'
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
        accessibilityLabel={title}
        testID={testIdWithKey(testIdForAccessabilityLabel(title))}
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
  const { ColorPallet } = useTheme()
  const styles = StyleSheet.create({
    iconContainer: {
      marginRight: 10,
      marginVertical: 6,
    },
  })

  return (
    <View style={{ marginVertical: 10, flexDirection: 'row', alignItems: 'flex-start' }}>
      <View style={styles.iconContainer}>
        <Icon name={'circle'} size={9} color={ColorPallet.brand.modalIcon} />
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
  const { ColorPallet, TextTheme, Assets } = useTheme()

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
      marginBottom: Platform.OS === 'ios' ? 108 : 80,
      position: 'relative',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
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
    },
    declineBodyText: {
      ...TextTheme.modalNormal,
      marginTop: 25,
    },
  })

  const titleForConfirmButton = (): string => {
    switch (usage) {
      case ModalUsage.ContactRemove:
        return t('ContactDetails.RemoveContact')
      case ModalUsage.ContactRemoveWithCredentials:
        return t('ContactDetails.GoToCredentials')
      case ModalUsage.CredentialRemove:
        return t('CredentialDetails.RemoveFromWallet')
      default:
        return t('Global.Decline')
    }
  }

  const labelForConfirmButton = (): string => {
    switch (usage) {
      case ModalUsage.ContactRemove:
        return t('ContactDetails.RemoveContact')
      case ModalUsage.ContactRemoveWithCredentials:
        return t('ContactDetails.GoToCredentials')
      case ModalUsage.CredentialRemove:
        return t('CredentialDetails.RemoveCredential')
      default:
        return t('Global.Decline')
    }
  }

  const testIdForConfirmButton = (): string => {
    switch (usage) {
      case ModalUsage.ContactRemove:
      case ModalUsage.CredentialRemove:
        return testIdWithKey('ConfirmRemoveButton')
      case ModalUsage.ContactRemoveWithCredentials:
        return testIdWithKey('GoToCredentialsButton')
      case ModalUsage.CredentialOfferDecline:
      case ModalUsage.ProofRequestDecline:
        return testIdWithKey('ConfirmDeclineButton')
      default:
        return testIdWithKey('ConfirmButton')
    }
  }

  const testIdForCancelButton = (): string => {
    switch (usage) {
      case ModalUsage.ContactRemove:
      case ModalUsage.CredentialRemove:
        return testIdWithKey('CancelRemoveButton')
      case ModalUsage.ContactRemoveWithCredentials:
        return testIdWithKey('AbortGoToCredentialsButton')
      case ModalUsage.CredentialOfferDecline:
      case ModalUsage.ProofRequestDecline:
        return testIdWithKey('CancelDeclineButton')
      default:
        return testIdWithKey('CancelButton')
    }
  }

  const headerImageForType = (): Element => {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
        {usage === ModalUsage.CredentialOfferDecline && <Assets.svg.proofRequestDeclined {...imageDisplayOptions} />}
        {usage === ModalUsage.ProofRequestDecline && <Assets.svg.credentialDeclined {...imageDisplayOptions} />}
        {usage === ModalUsage.CustomNotificationDecline && (
          <Assets.svg.deleteNotification style={{ marginBottom: 15 }} {...imageDisplayOptions} />
        )}
      </View>
    )
  }

  const contentForType = (): Element | null => {
    switch (usage) {
      case ModalUsage.ContactRemove:
        return (
          <View style={[{ marginBottom: 25 }]}>
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
      case ModalUsage.CredentialRemove:
        return (
          <View style={[{ marginBottom: 25 }]}>
            <View style={[{ marginBottom: 25 }]}>
              <Text style={[TextTheme.modalTitle]}>{t('CredentialDetails.RemoveTitle')}</Text>
            </View>
            <View>
              <Text style={[TextTheme.modalNormal]}>{t('CredentialDetails.RemoveCaption')}</Text>
            </View>
            <View style={{ marginTop: 25 }}>
              <Dropdown
                title={t('CredentialDetails.YouWillNotLose')}
                content={[
                  t('CredentialDetails.YouWillNotLoseListItem1'),
                  t('CredentialDetails.YouWillNotLoseListItem2'),
                ]}
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
      case ModalUsage.ContactRemoveWithCredentials:
        return (
          <View style={[{ marginBottom: 25 }]}>
            <View style={[{ marginBottom: 25 }]}>
              <Text style={[TextTheme.modalTitle]}>{t('ContactDetails.UnableToRemoveTitle')}</Text>
            </View>
            <View>
              <Text style={[styles.bodyText]}>{t('ContactDetails.UnableToRemoveCaption')}</Text>
            </View>
          </View>
        )
      case ModalUsage.CredentialOfferDecline:
        return (
          <View style={[{ marginBottom: 25 }]}>
            <Text style={[TextTheme.modalTitle]}>{t('CredentialOffer.DeclineTitle')}</Text>
            <Text style={[styles.declineBodyText, { marginTop: 30 }]}>{t('CredentialOffer.DeclineParagraph1')}</Text>
            <Text style={[styles.declineBodyText]}>{t('CredentialOffer.DeclineParagraph2')}</Text>
          </View>
        )
      case ModalUsage.ProofRequestDecline:
        return (
          <View style={[{ marginBottom: 25 }]}>
            <Text style={[TextTheme.modalTitle]}>{t('ProofRequest.DeclineTitle')}</Text>
            <Text style={[styles.declineBodyText, { marginTop: 30 }]}>{t('ProofRequest.DeclineBulletPoint1')}</Text>
            <Text style={[styles.declineBodyText]}>{t('ProofRequest.DeclineBulletPoint2')}</Text>
            <Text style={[styles.declineBodyText]}>{t('ProofRequest.DeclineBulletPoint3')}</Text>
          </View>
        )
      case ModalUsage.CustomNotificationDecline:
        return (
          <View style={[{ marginBottom: 25 }]}>
            <Text style={[TextTheme.modalTitle]}>{t('CredentialOffer.CustomOfferTitle')}</Text>
            <Text style={[styles.declineBodyText, { marginTop: 30 }]}>
              {t('CredentialOffer.CustomOfferParagraph1')}
            </Text>
            <Text style={[styles.declineBodyText]}>{t('CredentialOffer.CustomOfferParagraph2')}</Text>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.headerView]}>
          <TouchableOpacity
            accessibilityLabel={t('Global.Close')}
            accessibilityRole={'button'}
            testID={testIdWithKey('Close')}
            onPress={() => onCancel && onCancel()}
            hitSlop={hitSlop}
          >
            <Icon name={'close'} size={42} color={ColorPallet.brand.modalIcon} />
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
            <>
              {headerImageForType()}
              {contentForType()}
            </>
          </ScrollView>
          <View style={[styles.controlsContainer]}>
            <ContentGradient backgroundColor={ColorPallet.brand.modalPrimaryBackground} height={30} />
            <View style={[{ paddingTop: 10 }]}>
              <Button
                title={titleForConfirmButton()}
                accessibilityLabel={labelForConfirmButton()}
                testID={testIdForConfirmButton()}
                onPress={onSubmit}
                buttonType={
                  usage === ModalUsage.ContactRemoveWithCredentials ? ButtonType.ModalPrimary : ButtonType.ModalCritical
                }
              />
            </View>
            <View style={[{ paddingTop: 10 }]}>
              <Button
                title={t('Global.Cancel')}
                accessibilityLabel={t('Global.Cancel')}
                testID={testIdForCancelButton()}
                onPress={onCancel}
                buttonType={ButtonType.ModalSecondary}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  )
}

export default CommonRemoveModal
