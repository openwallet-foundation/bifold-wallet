import * as React from 'react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import Collapsible from 'react-native-collapsible'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from 'react-native-vector-icons/MaterialIcons'

import { hitSlop } from '../../constants'
import { useTheme } from '../../contexts/theme'
import { GenericFn } from '../../types/fn'
import { ModalUsage } from '../../types/remove'
import { testIdForAccessabilityLabel, testIdWithKey } from '../../utils/testable'
import Button, { ButtonType } from '../buttons/Button'
import BulletPoint from '../inputs/BulletPoint'
import ContentGradient from '../misc/ContentGradient'
import UnorderedList from '../misc/UnorderedList'
import { ThemedText } from '../texts/ThemedText'
import SafeAreaModal from './SafeAreaModal'

interface CommonRemoveModalProps {
  usage: ModalUsage
  onSubmit?: GenericFn
  onCancel?: GenericFn
  visible?: boolean
  extraDetails?: string
}

interface RemoveProps {
  title: string
  content: string[]
}

const Dropdown: React.FC<RemoveProps> = ({ title, content }) => {
  const { TextTheme, ColorPalette } = useTheme()
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
            backgroundColor: ColorPalette.brand.modalSecondaryBackground,
            borderRadius: 5,
            flexDirection: 'row',
            justifyContent: 'space-between',
          },
        ]}
      >
        <ThemedText variant="modalNormal" style={{ fontWeight: TextTheme.bold.fontWeight }}>
          {title}
        </ThemedText>
        <Icon name={isCollapsed ? 'expand-more' : 'expand-less'} size={24} color={TextTheme.modalNormal.color} />
      </TouchableOpacity>
      <Collapsible collapsed={isCollapsed} enablePointerEvents={true}>
        <View
          style={{ marginTop: 10, borderLeftWidth: 2, borderLeftColor: ColorPalette.brand.modalSecondaryBackground }}
        >
          <UnorderedList unorderedListItems={content} />
        </View>
      </Collapsible>
    </>
  )
}

const CommonRemoveModal: React.FC<CommonRemoveModalProps> = ({ usage, visible, onSubmit, onCancel, extraDetails }) => {
  if (!usage) {
    throw new Error('usage cannot be undefined')
  }

  const { t } = useTranslation()
  const { ColorPalette, TextTheme, Assets } = useTheme()

  const imageDisplayOptions = {
    height: 115,
    width: 115,
  }

  const styles = StyleSheet.create({
    safeAreaView: {
      backgroundColor: ColorPalette.brand.modalPrimaryBackground,
      borderTopRightRadius: 10,
      borderTopLeftRadius: 10,
    },
    container: {
      height: '100%',
      paddingTop: 10,
      paddingHorizontal: 20,
    },
    controlsContainer: {
      marginTop: 'auto',
      marginHorizontal: 20,
      marginBottom: 10,
      position: 'relative',
    },
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingTop: 65,
    },
    headerView: {
      alignItems: 'flex-end',
      height: 55,
      paddingTop: 10,
      paddingRight: 20,
    },
    bodyText: {
      ...TextTheme.modalNormal,
    },
    declineBodyText: {
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
          <View style={{ marginBottom: 25 }}>
            <View style={{ marginBottom: 25 }}>
              <ThemedText variant="modalTitle">{t('ContactDetails.RemoveTitle')}</ThemedText>
            </View>
            <View>
              <ThemedText variant="modalNormal" style={{ marginBottom: 24 }}>
                {t('ContactDetails.RemoveContactMessageWarning')}
              </ThemedText>
              <ThemedText variant="modalNormal">{t('ContactDetails.RemoveContactMessageTop')}</ThemedText>
              <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint1')} textStyle={styles.bodyText} />
              <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint2')} textStyle={styles.bodyText} />
              <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint3')} textStyle={styles.bodyText} />
              <BulletPoint text={t('ContactDetails.RemoveContactsBulletPoint4')} textStyle={styles.bodyText} />
              <ThemedText variant="modalNormal" style={{ marginTop: 24 }}>
                {t('ContactDetails.RemoveContactMessageBottom')}
              </ThemedText>
            </View>
          </View>
        )
      case ModalUsage.CredentialRemove:
        return (
          <View style={{ marginBottom: 25 }}>
            <View style={{ marginBottom: 25 }}>
              <ThemedText variant="modalTitle">{t('CredentialDetails.RemoveTitle')}</ThemedText>
            </View>
            <View>
              <ThemedText variant="modalNormal">{t('CredentialDetails.RemoveCaption')}</ThemedText>
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
          <View style={{ marginBottom: 25 }}>
            <View style={{ marginBottom: 25 }}>
              <ThemedText variant="modalTitle">{t('ContactDetails.UnableToRemoveTitle')}</ThemedText>
            </View>
            <View>
              <ThemedText variant="modalNormal">{t('ContactDetails.UnableToRemoveCaption')}</ThemedText>
            </View>
          </View>
        )
      case ModalUsage.CredentialOfferDecline:
        return (
          <View style={{ marginBottom: 25 }}>
            <ThemedText variant="modalTitle" style={{ marginTop: 15 }}>
              {t('CredentialOffer.DeclineTitle')}
            </ThemedText>
            <ThemedText variant="modalNormal" style={{ marginVertical: 30 }}>
              {extraDetails
                ? t('CredentialOffer.DeclineParagraph1WithIssuerName', { issuer: extraDetails })
                : t('CredentialOffer.DeclineParagraph1')}
            </ThemedText>
            <ThemedText variant="modalNormal">{t('CredentialOffer.DeclineParagraph2')}</ThemedText>
          </View>
        )
      case ModalUsage.ProofRequestDecline:
        return (
          <View style={{ marginBottom: 25 }}>
            <ThemedText variant="modalTitle">{t('ProofRequest.DeclineTitle')}</ThemedText>
            <ThemedText variant="modalNormal" style={{ marginTop: 30 }}>
              {t('ProofRequest.DeclineBulletPoint1')}
            </ThemedText>
            <ThemedText variant="modalNormal">{t('ProofRequest.DeclineBulletPoint2')}</ThemedText>
            <ThemedText variant="modalNormal">{t('ProofRequest.DeclineBulletPoint3')}</ThemedText>
          </View>
        )
      case ModalUsage.CustomNotificationDecline:
        return (
          <View style={{ marginBottom: 25 }}>
            <ThemedText variant="modalTitle">{t('CredentialOffer.CustomOfferTitle')}</ThemedText>
            <ThemedText variant="modalNormal" style={{ marginTop: 30 }}>
              {t('CredentialOffer.CustomOfferParagraph1')}
            </ThemedText>
            <ThemedText variant="modalNormal">{t('CredentialOffer.CustomOfferParagraph2')}</ThemedText>
          </View>
        )
      default:
        return null
    }
  }

  return (
    <SafeAreaModal transparent={true} visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeAreaView}>
          <View style={styles.headerView}>
            <TouchableOpacity
              accessibilityLabel={t('Global.Close')}
              accessibilityRole={'button'}
              testID={testIdWithKey('Close')}
              onPress={() => onCancel && onCancel()}
              hitSlop={hitSlop}
            >
              <Icon name={'close'} size={42} color={ColorPalette.brand.modalIcon} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.container}>
            <>
              {headerImageForType()}
              {contentForType()}
            </>
          </ScrollView>
          <View style={styles.controlsContainer}>
            <ContentGradient backgroundColor={ColorPalette.brand.modalPrimaryBackground} height={30} />
            <View style={{ paddingTop: 10 }}>
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
            <View style={{ paddingTop: 10 }}>
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
    </SafeAreaModal>
  )
}

export default CommonRemoveModal
