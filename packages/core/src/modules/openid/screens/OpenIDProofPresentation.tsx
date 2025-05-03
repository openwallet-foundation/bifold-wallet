import { useEffect, useMemo, useState } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { useTranslation } from 'react-i18next'
import { StackScreenProps } from '@react-navigation/stack'

import { DeliveryStackParams, Screens, TabStacks } from '../../../types/navigators'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  formatDifPexCredentialsForRequest,
  FormattedSelectedCredentialEntry,
  FormattedSubmissionEntry,
} from '../displayProof'
import { testIdWithKey } from '../../../utils/testable'
import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { ModalUsage } from '../../../types/remove'
import Button, { ButtonType } from '../../../components/buttons/Button'
import { useTheme } from '../../../contexts/theme'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { shareProof } from '../resolverProof'
import ProofRequestAccept from '../../../screens/ProofRequestAccept'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'
import { CredentialCard } from '../../../components/misc'
import { getCredentialForDisplay } from '../display'
import { buildFieldsFromW3cCredsCredential } from '../../../utils/oca'
import { Attribute } from '@bifold/oca/build/legacy'
import ScreenLayout from '../../../layout/ScreenLayout'
import { isSdJwtProofRequest, isW3CProofRequest } from '../utils/utils'

type OpenIDProofPresentationProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDProofPresentation>

const OpenIDProofPresentation: React.FC<OpenIDProofPresentationProps> = ({
  navigation,
  route: {
    params: { credential },
  },
}: OpenIDProofPresentationProps) => {
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [credentialsRequested, setCredentialsRequested] = useState<
    Array<W3cCredentialRecord | SdJwtVcRecord | MdocRecord>
  >([])
  const { getW3CCredentialById, getSdJwtCredentialById } = useOpenIDCredentials()

  const { ColorPallet, ListItems, TextTheme } = useTheme()
  const { t } = useTranslation()
  const { agent } = useAgent()

  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)

  const styles = StyleSheet.create({
    pageContent: {
      flexGrow: 1,
      justifyContent: 'space-between',
      padding: 10,
    },
    credentialsList: {
      marginTop: 20,
      justifyContent: 'space-between',
    },
    headerTextContainer: {
      paddingVertical: 16,
    },
    headerText: {
      ...ListItems.recordAttributeText,
      flexShrink: 1,
    },
    footerButton: {
      paddingTop: 10,
    },
    cardContainer: {
      paddingHorizontal: 25,
      paddingVertical: 16,
      backgroundColor: ColorPallet.brand.secondaryBackground,
      marginBottom: 20,
    },
    cardAttributes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      borderColor: ColorPallet.grayscale.lightGrey,
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
    },
    cardGroupContainer: {
      borderRadius: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    cardGroupHeader: {
      padding: 8,
      marginVertical: 8,
    },
  })

  const submission = useMemo(
    () =>
      credential && credential.credentialsForRequest
        ? formatDifPexCredentialsForRequest(credential.credentialsForRequest)
        : undefined,
    [credential]
  )

  const selectedCredentials:
    | {
        [inputDescriptorId: string]: {
          id: string
          claimFormat: string
        }
      }
    | undefined = useMemo(
    () =>
      submission?.entries.reduce((acc, entry) => {
        if (entry.isSatisfied) {
          //TODO: Support multiplae credentials
          return {
            ...acc,
            [entry.inputDescriptorId]: {
              id: entry.credentials[0].id,
              claimFormat: entry.credentials[0].claimFormat,
            },
          }
        }
        return acc
      }, {}),
    [submission]
  )

  useEffect(() => {
    async function fetchCreds() {
      if (!selectedCredentials) return

      const creds: Array<W3cCredentialRecord | SdJwtVcRecord | MdocRecord> = []

      for (const [inputDescriptorID, { id, claimFormat }] of Object.entries(selectedCredentials)) {
        let credential: W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined
        if (isW3CProofRequest(claimFormat)) {
          credential = await getW3CCredentialById(id)
        } else if (isSdJwtProofRequest(claimFormat)) {
          credential = await getSdJwtCredentialById(id)
        }

        if (credential && inputDescriptorID) {
          creds.push(credential)
        }
      }
      setCredentialsRequested(creds)
    }
    fetchCreds()
  }, [selectedCredentials, getW3CCredentialById, getSdJwtCredentialById])

  const { verifierName } = useMemo(() => {
    return { verifierName: credential?.verifierHostName }
  }, [credential])

  const handleAcceptTouched = async () => {
    try {
      if (!agent || !credential.credentialsForRequest || !selectedCredentials) {
        return
      }
      await shareProof({
        agent,
        authorizationRequest: credential.authorizationRequest,
        credentialsForRequest: credential.credentialsForRequest,
        selectedCredentials,
      })

      setAcceptModalVisible(true)
    } catch (err: unknown) {
      setButtonsVisible(true)
      const error = new BifoldError(t('Error.Title1027'), t('Error.Message1027'), (err as Error)?.message ?? err, 1027)
      DeviceEventEmitter.emit(EventTypes.ERROR_ADDED, error)
    }
  }

  const handleDeclineTouched = async () => {
    toggleDeclineModalVisible()
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const handleDismiss = async () => {
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  const renderHeader = () => {
    return (
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText} testID={testIdWithKey('HeaderText')}>
          <Text style={TextTheme.normal}>{t('ProofRequest.ReceiveProofTitle')}</Text>
          {'\n'}
          <Text style={TextTheme.title}>{verifierName ? verifierName : ''}</Text>
        </Text>
      </View>
    )
  }

  const renderCard = (
    sub: FormattedSubmissionEntry,
    selectedCredential: FormattedSelectedCredentialEntry,
    //TODO: Support multiplae credentials
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hasMultipleCreds: boolean
  ) => {
    const credential = credentialsRequested.find((c) => c.id === selectedCredential.id)
    if (!credential) {
      return null
    }
    const credentialDisplay = getCredentialForDisplay(credential)
    const requestedAttributes = selectedCredential.requestedAttributes
    const fields = buildFieldsFromW3cCredsCredential(credentialDisplay, requestedAttributes)
    return (
      <CredentialCard
        credential={credential}
        displayItems={fields as Attribute[]}
        //TODO: Support multiplae credentials
        // hasAltCredentials={hasMultipleCreds}
        // handleAltCredChange={selectAltCredentail}
      />
    )
  }

  const renderBody = () => {
    if (!submission) return null

    return (
      <View style={styles.credentialsList}>
        {submission.entries.map((s, i) => {
          //TODO: Support multiplae credentials
          const selectedCredential = s.credentials[0]

          const globalSubmissionName = submission.name
          const globalSubmissionPurpose = submission.purpose
          const submissionName = s.name
          const submissionPurpose = s.purpose

          const name = submissionName || globalSubmissionName || undefined
          const purpose = submissionPurpose || globalSubmissionPurpose || undefined

          return (
            <View key={i}>
              <View style={styles.cardContainer}>
                <View style={styles.cardGroupContainer}>
                  {name && purpose && (
                    <View style={styles.cardGroupHeader}>
                      <Text style={TextTheme.bold}>{name}</Text>
                      <Text style={TextTheme.labelTitle}>{purpose}</Text>
                    </View>
                  )}
                  {s.isSatisfied && selectedCredential?.requestedAttributes ? (
                    renderCard(s, selectedCredential, s.credentials.length > 1)
                  ) : (
                    <Text style={TextTheme.normal}>{t('ProofRequest.CredentialNotInWallet')}</Text>
                  )}
                </View>
              </View>
            </View>
          )
        })}
      </View>
    )
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
        {selectedCredentials && Object.keys(selectedCredentials).length > 0 ? (
          <>
            {footerButton(
              t('Global.Send'),
              handleAcceptTouched,
              ButtonType.Primary,
              testIdWithKey('AcceptCredentialOffer'),
              t('Global.Send')
            )}
            {footerButton(
              t('Global.Decline'),
              toggleDeclineModalVisible,
              ButtonType.Secondary,
              testIdWithKey('DeclineCredentialOffer'),
              t('Global.Decline')
            )}
          </>
        ) : (
          <>
            {footerButton(
              t('Global.Dismiss'),
              handleDismiss,
              ButtonType.Primary,
              testIdWithKey('DismissCredentialOffer'),
              t('Global.Dismiss')
            )}
          </>
        )}
      </View>
    )
  }

  return (
    <ScreenLayout screen={Screens.OpenIDCredentialDetails}>
      <ScrollView>
        <View style={styles.pageContent}>
          {renderHeader()}
          {renderBody()}
        </View>
      </ScrollView>
      {footer()}

      <ProofRequestAccept visible={acceptModalVisible} proofId={''} confirmationOnly={true} />
      <CommonRemoveModal
        usage={ModalUsage.ProofRequestDecline}
        visible={declineModalVisible}
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </ScreenLayout>
  )
}

export default OpenIDProofPresentation
