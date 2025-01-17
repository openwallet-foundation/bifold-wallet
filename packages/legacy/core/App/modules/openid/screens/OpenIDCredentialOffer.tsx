import React, { useEffect } from 'react'
import { StackScreenProps } from '@react-navigation/stack'
import { DeliveryStackParams, Screens, TabStacks } from '../../../types/navigators'
import { getCredentialForDisplay } from '../display'
import { Edge, SafeAreaView } from 'react-native-safe-area-context'
import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { ModalUsage } from '../../../types/remove'
import { useState } from 'react'
import { DeviceEventEmitter, StyleSheet, Text, View } from 'react-native'
import { TextTheme } from '../../../theme'
import { useTranslation } from 'react-i18next'
import Button, { ButtonType } from '../../../components/buttons/Button'
import { testIdWithKey } from '../../../utils/testable'
import { useTheme } from '../../../contexts/theme'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { useAgent } from '@credo-ts/react-hooks'
import CredentialOfferAccept from '../../../screens/CredentialOfferAccept'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { CredentialOverlay, OCABundleResolveAllParams } from '@hyperledger/aries-oca/build/legacy'
import { TOKENS, useServices } from '../../../container-api'
import { BrandingOverlay } from '@hyperledger/aries-oca'
import Record from '../../../components/record/Record'
import { CredentialCard } from '../../../components/misc'
import { buildFieldsFromW3cCredsCredential } from '../../../utils/oca'

type OpenIDCredentialDetailsProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDCredentialOffer>

const OpenIDCredentialOffer: React.FC<OpenIDCredentialDetailsProps> = ({ navigation, route }) => {
  // FIXME: change params to accept credential id to avoid 'non-serializable' warnings
  const { credential } = route.params
  const credentialDisplay = getCredentialForDisplay(credential)
  const { display } = credentialDisplay
  const { t, i18n } = useTranslation()
  const { ColorPallet } = useTheme()
  const { agent } = useAgent()
  const { storeCredential } = useOpenIDCredentials()

  const [isRemoveModalDisplayed, setIsRemoveModalDisplayed] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)

  const [bundleResolver] = useServices([TOKENS.UTIL_OCA_RESOLVER])

  const [overlay, setOverlay] = useState<CredentialOverlay<BrandingOverlay>>({
    bundle: undefined,
    presentationFields: [],
    metaOverlay: undefined,
    brandingOverlay: undefined,
  })

  useEffect(() => {
    if (!credentialDisplay || !bundleResolver || !i18n || !credentialDisplay.display) {
      return
    }

    const resolveOverlay = async () => {
      const params: OCABundleResolveAllParams = {
        identifiers: {
          schemaId: '',
          credentialDefinitionId: credentialDisplay.id,
        },
        meta: {
          alias: credentialDisplay.display.issuer.name,
          credConnectionId: undefined,
          credName: credentialDisplay.display.name,
        },
        attributes: buildFieldsFromW3cCredsCredential(credentialDisplay),
        language: i18n.language,
      }

      const bundle = await bundleResolver.resolveAllBundles(params)

      setOverlay({
        ...(bundle as CredentialOverlay<BrandingOverlay>),
        presentationFields: bundle.presentationFields,
      })
    }

    resolveOverlay()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bundleResolver, i18n.language])

  const styles = StyleSheet.create({
    headerTextContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
    },
    headerText: {
      ...TextTheme.normal,
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
  })

  const toggleDeclineModalVisible = () => setIsRemoveModalDisplayed(!isRemoveModalDisplayed)

  const handleDeclineTouched = async () => {
    toggleDeclineModalVisible()
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const handleAcceptTouched = async () => {
    if (!agent) {
      return
    }
    try {
      await storeCredential(credential)
      setAcceptModalVisible(true)
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1024'), t('Error.Message1024'), (err as Error)?.message ?? err, 1024)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const footerButton = (
    title: string,
    buttonPress: () => void,
    buttonType: ButtonType,
    testID: string,
    accessibilityLabel: string
  ) => {
    return (
      <View style={styles.footerButton}>
        <Button
          title={title}
          accessibilityLabel={accessibilityLabel}
          testID={testID}
          buttonType={buttonType}
          onPress={buttonPress}
          disabled={!buttonsVisible}
        />
      </View>
    )
  }

  const header = () => {
    return (
      <>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
            <Text>{display.issuer.name || t('ContactDetails.AContact')}</Text>{' '}
            {t('CredentialOffer.IsOfferingYouACredential')}
          </Text>
        </View>
        {credential && (
          <View style={{ marginHorizontal: 15, marginBottom: 16 }}>
            <CredentialCard credential={credential} />
          </View>
        )}
      </>
    )
  }

  const footer = () => {
    const paddingHorizontal = 24
    const paddingVertical = 16
    const paddingBottom = 26
    return (
      <View style={{ marginBottom: 50 }}>
        <View
          style={{
            paddingHorizontal: paddingHorizontal,
            paddingVertical: paddingVertical,
            paddingBottom: paddingBottom,
            backgroundColor: ColorPallet.brand.secondaryBackground,
          }}
        >
          {footerButton(
            t('Global.Accept'),
            handleAcceptTouched,
            ButtonType.Primary,
            testIdWithKey('AcceptCredentialOffer'),
            t('Global.Accept')
          )}
          {footerButton(
            t('Global.Decline'),
            toggleDeclineModalVisible,
            ButtonType.Secondary,
            testIdWithKey('DeclineCredentialOffer'),
            t('Global.Decline')
          )}
        </View>
      </View>
    )
  }

  const screenEdges: Edge[] = ['bottom', 'left', 'right']

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={screenEdges}>
      <Record fields={overlay.presentationFields || []} hideFieldValues header={header} footer={footer} />
      <CredentialOfferAccept visible={acceptModalVisible} credentialId={''} confirmationOnly={true} />
      <CommonRemoveModal
        usage={ModalUsage.CredentialOfferDecline}
        visible={isRemoveModalDisplayed}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </SafeAreaView>
  )
}

export default OpenIDCredentialOffer
