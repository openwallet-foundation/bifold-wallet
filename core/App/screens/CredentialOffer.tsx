import { CredentialMetadataKeys, CredentialPreviewAttributeOptions } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { StackNavigationProp, StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Unorderedlist from 'react-native-unordered-list'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

import RecordLoading from '../components/animated/RecordLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import CredentialCard from '../components/misc/CredentialCard'
import InfoBox, { InfoBoxType } from '../components/misc/InfoBox'
import Record from '../components/record/Record'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { RootStackParams, Stacks, NotificationStackParams, SettingStackParams, Screens } from '../types/navigators'
import { testIdWithKey } from '../utils/testable'

import CredentialOfferAccept from './CredentialOfferAccept'

type CredentialOfferProps = StackScreenProps<NotificationStackParams, Screens.CredentialOffer>

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialOffer route prams were not set properly')
  }

  const { credentialId } = route.params

  const { agent } = useAgent()
  const { t } = useTranslation()
  const [, dispatch] = useStore()
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [infoCardVisible, setInfoCardVisible] = useState(false)
  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = credential?.connectionId
    ? useConnectionById(credential.connectionId)?.theirLabel
    : credential?.connectionId ?? ''
  const [credentialAttributes, setCredentialAttributes] = useState<CredentialPreviewAttributeOptions[]>([])
  // This syntax is required for the jest mocks to work
  // eslint-disable-next-line import/no-named-as-default-member
  const [loading, setLoading] = React.useState<boolean>(true)
  const { ListItems, ColorPallet, TextTheme } = useTheme()

  const settingsNavigation = useNavigation<StackNavigationProp<RootStackParams>>()

  const styles = StyleSheet.create({
    modalCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    notifyTextContainer: {
      borderLeftColor: ColorPallet.brand.highlight,
      borderLeftWidth: 10,
      flex: 1,
      paddingLeft: 10,
      paddingVertical: 15,
      marginVertical: 15,
    },
    fakeLink: {
      ...TextTheme.normal,
      ...ListItems.recordLink,
      textDecorationLine: 'underline',
    },
    row: {
      flexDirection: 'row',
    },
    notifyTitle: {
      ...TextTheme.title,
      marginBottom: 5,
    },
    notifyText: {
      ...TextTheme.normal,
      marginVertical: 5,
    },
    notifyTextList: {
      marginVertical: 6,
    },
    informationIcon: {
      color: ColorPallet.brand.link,
      marginLeft: 10,
    },
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...ListItems.recordAttributeLabel,
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
  })

  useEffect(() => {
    if (!agent) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1035'),
              t('Error.Message1035'),
              t('CredentialOffer.CredentialNotFound'),
              1035
            ),
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    if (!credential) {
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [
          {
            error: new BifoldError(
              t('Error.Title1035'),
              t('Error.Message1035'),
              t('CredentialOffer.CredentialNotFound'),
              1035
            ),
          },
        ],
      })
    }
  }, [])

  useEffect(() => {
    if (!(agent && credential)) {
      return
    }
    setLoading(true)
    agent?.credentials.getFormatData(credential.id).then(({ offer, offerAttributes }) => {
      credential.metadata.add(CredentialMetadataKeys.IndyCredential, {
        schemaId: offer?.indy?.schema_id,
        credentialDefinitionId: offer?.indy?.cred_def_id,
      })
      setCredentialAttributes(offerAttributes || [])
      setLoading(false)
    })
  }, [credential])

  const handleAcceptPress = async () => {
    try {
      if (!(agent && credential)) {
        return
      }
      setAcceptModalVisible(true)
      await agent.credentials.acceptOffer({ credentialRecordId: credential.id })
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error).message, 1024)
      dispatch({
        type: DispatchAction.ERROR_ADDED,
        payload: [{ error }],
      })
    }
  }

  const handleDeclinePress = async () => {
    navigation.navigate(Screens.CommonDecline, {
      declineType: DeclineType.CredentialOffer,
      itemId: credentialId,
    })
  }

  const toggleInfoCard = async () => {
    setInfoCardVisible(!infoCardVisible)
  }

  const goToSettings = async () => {
    toggleInfoCard()
    settingsNavigation.navigate(Stacks.SettingStack, { screen: Screens.Settings })
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <Record
        header={() => (
          <>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
                <Text>{credentialConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
                {t('CredentialOffer.IsOfferingYouACredential')}
              </Text>
            </View>
            {!loading && credential && (
              <CredentialCard credential={credential} style={{ marginHorizontal: 15, marginBottom: 16 }} />
            )}
          </>
        )}
        footer={() => (
          <View
            style={{
              paddingHorizontal: 25,
              paddingVertical: 16,
              paddingBottom: 26,
              backgroundColor: ColorPallet.brand.secondaryBackground,
            }}
          >
            {loading ? <RecordLoading /> : null}
            <View style={styles.notifyTextContainer}>
              <View style={styles.row}>
                <Text style={styles.notifyTitle}>{t('CredentialOffer.AddedContacts')}</Text>
                <Icon name={'information-outline'} size={30} style={styles.informationIcon} onPress={toggleInfoCard} />
              </View>
              <Modal visible={infoCardVisible} transparent>
                <View style={styles.modalCenter}>
                  <InfoBox
                    notificationType={InfoBoxType.Info}
                    title={t('CredentialOffer.WhatAreContacts')}
                    bodyContent={
                      <View>
                        <Text style={styles.notifyText}>{t('CredentialOffer.PopupIntro')}</Text>
                        <Unorderedlist color={styles.notifyText.color} style={styles.notifyTextList}>
                          <Text style={styles.notifyText}>{t('CredentialOffer.PopupPoint1')}</Text>
                        </Unorderedlist>
                        <Unorderedlist color={styles.notifyText.color} style={styles.notifyTextList}>
                          <Text style={styles.notifyText}>{t('CredentialOffer.PopupPoint2')}</Text>
                        </Unorderedlist>
                        <Unorderedlist color={styles.notifyText.color} style={styles.notifyTextList}>
                          <Text style={styles.notifyText}>{t('CredentialOffer.PopupPoint3')}</Text>
                        </Unorderedlist>
                        <Text style={styles.notifyText}>
                          {t('CredentialOffer.SettingsInstruction')}
                          <Text style={styles.fakeLink} onPress={goToSettings}>
                            {t('CredentialOffer.SettingsLink')}
                          </Text>
                          .
                        </Text>
                        <Text style={styles.notifyText}>{t('CredentialOffer.PrivacyMessage')}</Text>
                      </View>
                    }
                    onCallToActionLabel={t('CredentialOffer.PopupExit')}
                    onCallToActionPressed={toggleInfoCard}
                  />
                </View>
              </Modal>
              <Text style={styles.notifyText}>
                {t('CredentialOffer.NotificationBodyUpper') +
                  (credentialConnectionLabel || t('ContactDetails.AContact').toLowerCase()) +
                  t('CredentialOffer.NotificationBodyLower')}
              </Text>
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Accept')}
                accessibilityLabel={t('Global.Accept')}
                testID={testIdWithKey('AcceptCredentialOffer')}
                buttonType={ButtonType.Primary}
                onPress={handleAcceptPress}
                disabled={!buttonsVisible}
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                title={t('Global.Decline')}
                accessibilityLabel={t('Global.Decline')}
                testID={testIdWithKey('DeclineCredentialOffer')}
                buttonType={ButtonType.Secondary}
                onPress={handleDeclinePress}
                disabled={!buttonsVisible}
              />
            </View>
          </View>
        )}
        fields={credentialAttributes}
      />
      <CredentialOfferAccept visible={acceptModalVisible} credentialId={credentialId} />
    </SafeAreaView>
  )
}

export default CredentialOffer
