import { CredentialMetadataKeys, CredentialPreviewAttribute } from '@aries-framework/core'
import { useAgent, useCredentialById } from '@aries-framework/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text, DeviceEventEmitter } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import Button, { ButtonType } from '../components/buttons/Button'
import ConnectionAlert from '../components/misc/ConnectionAlert'
import ConnectionImage from '../components/misc/ConnectionImage'
import CredentialCard from '../components/misc/CredentialCard'
import Record from '../components/record/Record'
import { EventTypes } from '../constants'
import { useAnimatedComponents } from '../contexts/animated-components'
import { useConfiguration } from '../contexts/configuration'
import { useNetwork } from '../contexts/network'
import { useTheme } from '../contexts/theme'
import { DeclineType } from '../types/decline'
import { BifoldError } from '../types/error'
import { NotificationStackParams, Screens } from '../types/navigators'
import { CardLayoutOverlay11, CredentialOverlay } from '../types/oca'
import { getCredentialIdentifiers, isValidIndyCredential } from '../utils/credential'
import { getCredentialConnectionLabel } from '../utils/helpers'
import { buildFieldsFromIndyCredential } from '../utils/oca'
import { testIdWithKey } from '../utils/testable'

import CredentialOfferAccept from './CredentialOfferAccept'

type CredentialOfferProps = StackScreenProps<NotificationStackParams, Screens.CredentialOffer>

const CredentialOffer: React.FC<CredentialOfferProps> = ({ navigation, route }) => {
  if (!route?.params) {
    throw new Error('CredentialOffer route prams were not set properly')
  }

  const { credentialId } = route.params

  const { agent } = useAgent()
  const { t, i18n } = useTranslation()
  const { ListItems, ColorPallet } = useTheme()
  const { RecordLoading } = useAnimatedComponents()
  const { assertConnectedNetwork } = useNetwork()
  const { OCABundleResolver } = useConfiguration()

  const [loading, setLoading] = useState<boolean>(true)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)

  const [overlay, setOverlay] = useState<CredentialOverlay<CardLayoutOverlay11>>({ presentationFields: [] })

  const credential = useCredentialById(credentialId)
  const credentialConnectionLabel = getCredentialConnectionLabel(credential)

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
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1035'), t('Error.Message1035'), t('CredentialOffer.CredentialNotFound'), 1035)
      )
    }
  }, [])

  useEffect(() => {
    if (!credential) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1035'), t('Error.Message1035'), t('CredentialOffer.CredentialNotFound'), 1035)
      )
    }
  }, [])

  useEffect(() => {
    if (!(credential && isValidIndyCredential(credential))) {
      return
    }

    const updateCredentialPreview = async () => {
      const { ...formatData } = await agent?.credentials.getFormatData(credential.id)
      const { offer, offerAttributes } = formatData

      credential.metadata.add(CredentialMetadataKeys.IndyCredential, {
        schemaId: offer?.indy?.schema_id,
        credentialDefinitionId: offer?.indy?.cred_def_id,
      })

      if (offerAttributes) {
        credential.credentialAttributes = [...offerAttributes.map((item) => new CredentialPreviewAttribute(item))]
      }
    }

    const resolvePresentationFields = async () => {
      const identifiers = getCredentialIdentifiers(credential)
      const attributes = buildFieldsFromIndyCredential(credential)
      const fields = await OCABundleResolver.presentationFields({ identifiers, attributes, language: i18n.language })
      return { fields }
    }

    /**
     * FIXME: Formatted data needs to be added to the record in AFJ extensions
     * For now the order here matters. The credential preview must be updated to
     * add attributes (since these are not available in the offer).
     * Once the credential is updated the presentation fields can be correctly resolved
     */
    setLoading(true)
    updateCredentialPreview()
      .then(() => resolvePresentationFields())
      .then(({ fields }) => {
        setOverlay({ ...overlay, presentationFields: fields })
        setLoading(false)
      })
  }, [credential])

  const handleAcceptPress = async () => {
    try {
      if (!(agent && credential && assertConnectedNetwork())) {
        return
      }
      setAcceptModalVisible(true)
      await agent.credentials.acceptOffer({ credentialRecordId: credential.id })
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error).message, 1024)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleDeclinePress = async () => {
    navigation.navigate(Screens.CommonDecline, {
      declineType: DeclineType.CredentialOffer,
      itemId: credentialId,
    })
  }

  const header = () => {
    return (
      <>
        <ConnectionImage connectionId={credential?.connectionId} />
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            <Text>{credentialConnectionLabel || t('ContactDetails.AContact')}</Text>{' '}
            {t('CredentialOffer.IsOfferingYouACredential')}
          </Text>
        </View>
        {!loading && credential && (
          <View style={{ marginHorizontal: 15, marginBottom: 16 }}>
            <CredentialCard credential={credential} />
          </View>
        )}
      </>
    )
  }

  const footer = () => {
    return (
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
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <Record fields={overlay.presentationFields || []} header={header} footer={footer} />
      <CredentialOfferAccept visible={acceptModalVisible} credentialId={credentialId} />
    </SafeAreaView>
  )
}

export default CredentialOffer
