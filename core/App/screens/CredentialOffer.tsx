import { CredentialMetadataKeys, CredentialPreviewAttributeOptions } from '@aries-framework/core'
import { useAgent, useConnectionById, useCredentialById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import RecordLoading from '../components/animated/RecordLoading'
import Button, { ButtonType } from '../components/buttons/Button'
import ConnectionAlert from '../components/misc/ConnectionAlert'
import CredentialCard from '../components/misc/CredentialCard'
import Record from '../components/record/Record'
import { DispatchAction } from '../contexts/reducers/store'
import { useStore } from '../contexts/store'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
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
  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = credential?.connectionId
    ? useConnectionById(credential.connectionId)?.theirLabel
    : credential?.connectionId ?? ''
  const [credentialAttributes, setCredentialAttributes] = useState<CredentialPreviewAttributeOptions[]>([])
  // This syntax is required for the jest mocks to work
  // eslint-disable-next-line import/no-named-as-default-member
  const [loading, setLoading] = React.useState<boolean>(true)
  const { ListItems, ColorPallet } = useTheme()

  const styles = StyleSheet.create({
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
            <ConnectionAlert connectionID={credentialConnectionLabel} />
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
