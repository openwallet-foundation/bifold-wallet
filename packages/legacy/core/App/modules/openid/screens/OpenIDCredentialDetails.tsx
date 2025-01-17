import React, { useEffect, useState } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { CredentialStackParams, Screens } from '../../../types/navigators'
import { getCredentialForDisplay } from '../display'
import { SafeAreaView } from 'react-native-safe-area-context'
import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { ModalUsage } from '../../../types/remove'
import { DeviceEventEmitter, StyleSheet, Text, View } from 'react-native'
import { TextTheme } from '../../../theme'
import { useTranslation } from 'react-i18next'
import { testIdWithKey } from '../../../utils/testable'
import { useTheme } from '../../../contexts/theme'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { useAgent } from '@credo-ts/react-hooks'
import RecordRemove from '../../../components/record/RecordRemove'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { CredentialOverlay } from '@hyperledger/aries-oca/build/legacy'
import { W3cCredentialDisplay } from '../types'
import { TOKENS, useServices } from '../../../container-api'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import Record from '../../../components/record/Record'
import { W3cCredentialRecord } from '@credo-ts/core'
import { buildOverlayFromW3cCredential } from '../../../utils/oca'
import CredentialDetailSecondaryHeader from '../../../components/views/CredentialDetailSecondaryHeader'
import CredentialCardLogo from '../../../components/views/CredentialCardLogo'
import CredentialDetailPrimaryHeader from '../../../components/views/CredentialDetailPrimaryHeader'

export enum OpenIDCredScreenMode {
  offer,
  details,
}

type OpenIDCredentialDetailsProps = StackScreenProps<CredentialStackParams, Screens.OpenIDCredentialDetails>

const paddingHorizontal = 24
const paddingVertical = 16

const OpenIDCredentialDetails: React.FC<OpenIDCredentialDetailsProps> = ({ navigation, route }) => {
  const { credentialId } = route.params

  const [credential, setCredential] = useState<W3cCredentialRecord | undefined>(undefined)
  const [credentialDisplay, setCredentialDisplay] = useState<W3cCredentialDisplay>()
  const { t, i18n } = useTranslation()
  const { ColorPallet } = useTheme()
  const { agent } = useAgent()
  const { removeCredential } = useOpenIDCredentials()
  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])

  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState(false)

  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    brandingOverlay: undefined,
  })

  const styles = StyleSheet.create({
    container: {
      backgroundColor: overlay.brandingOverlay?.primaryBackgroundColor,
      display: 'flex',
    },
  })

  useEffect(() => {
    if (!agent) return

    const fetchCredential = async () => {
      try {
        const credentialExchangeRecord = await agent.w3cCredentials.getCredentialRecordById(credentialId)
        setCredential(credentialExchangeRecord)
      } catch (error) {
        // credential not found for id, display an error
        DeviceEventEmitter.emit(
          EventTypes.ERROR_ADDED,
          new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033)
        )
      }
    }
    fetchCredential()
  }, [credentialId, agent, t])

  useEffect(() => {
    if (!credential) return

    try {
      const credDisplay = getCredentialForDisplay(credential)
      setCredentialDisplay(credDisplay)
    } catch (error) {
      DeviceEventEmitter.emit(
        EventTypes.ERROR_ADDED,
        new BifoldError(t('Error.Title1033'), t('Error.Message1033'), t('CredentialDetails.CredentialNotFound'), 1033)
      )
    }
  }, [credential, t])

  useEffect(() => {
    if (!credentialDisplay || !bundleResolver || !i18n || !credentialDisplay.display) {
      return
    }

    const resolveOverlay = async () => {
      const resolvedOverlay = await buildOverlayFromW3cCredential({
        credentialDisplay,
        language: i18n.language,
        resolver: bundleResolver,
      })

      setOverlay(resolvedOverlay)
    }

    resolveOverlay()
  }, [credentialDisplay, bundleResolver, i18n])

  const toggleDeclineModalVisible = () => setIsRemoveModalDisplayed(!isRemoveModalDisplayed)

  const handleDeclineTouched = async () => {
    handleRemove()
  }

  const handleRemove = async () => {
    if (!credential) return
    try {
      await removeCredential(credential)
      navigation.pop()
    } catch (err) {
      const error = new BifoldError(t('Error.Title1025'), t('Error.Message1025'), (err as Error)?.message ?? err, 1025)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const header = () => {
    if (!credentialDisplay) return null

    return (
      <View style={styles.container}>
        <CredentialDetailSecondaryHeader overlay={overlay} />
        <CredentialCardLogo overlay={overlay} />
        <CredentialDetailPrimaryHeader overlay={overlay} />
      </View>
    )
  }

  const footer = () => {
    if (!credentialDisplay) return null
    return (
      <View style={{ marginBottom: 50 }}>
        <View
          style={{
            backgroundColor: ColorPallet.brand.secondaryBackground,
            marginTop: paddingVertical,
            paddingHorizontal,
            paddingVertical,
          }}
        >
          <Text testID={testIdWithKey('IssuerName')}>
            <Text style={[TextTheme.title]}>{t('CredentialDetails.IssuedBy') + ' '}</Text>
            <Text style={[TextTheme.normal]}>
              {credentialDisplay.display.issuer.name || t('ContactDetails.AContact')}
            </Text>
          </Text>
        </View>
        <RecordRemove onRemove={toggleDeclineModalVisible} />
      </View>
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['left', 'right']}>
      <Record fields={overlay.presentationFields || []} hideFieldValues header={header} footer={footer} />
      <CommonRemoveModal
        usage={ModalUsage.CredentialRemove}
        visible={isRemoveModalDisplayed}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default OpenIDCredentialDetails
