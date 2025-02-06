import { useEffect, useMemo, useState } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { useTranslation } from 'react-i18next'
import { StackScreenProps } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'

import { DeliveryStackParams, Screens, TabStacks } from '../../../types/navigators'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import {
  formatDifPexCredentialsForRequest,
  FormattedSelectedCredentialEntry,
  FormattedSubmissionEntry,
} from '../displayProof'
import { testIdWithKey } from '../../../utils/testable'
import { OpenIDCredentialRowCard } from '../components/CredentialRowCard'
import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { ModalUsage } from '../../../types/remove'
import Button, { ButtonType } from '../../../components/buttons/Button'
import { useTheme } from '../../../contexts/theme'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { shareProof } from '../resolverProof'
import ProofRequestAccept from '../../../screens/ProofRequestAccept'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { W3cCredentialRecord } from '@credo-ts/core'
import { CredentialCard } from '../../../components/misc'
import { getCredentialForDisplay } from '../display'
import { buildFieldsFromW3cCredsCredential } from '../../../utils/oca'
import { Attribute } from '@hyperledger/aries-oca/build/legacy'

type OpenIDProofPresentationProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDProofPresentation>

const OpenIDProofPresentation: React.FC<OpenIDProofPresentationProps> = ({
  navigation,
  route: {
    params: { credential },
  },
}: OpenIDProofPresentationProps) => {
  //   console.log('DUMp Record:', JSON.stringify(credential))

  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [credentialsRequested, setCredentialsRequested] = useState<W3cCredentialRecord[]>([])
  const { getCredentialById } = useOpenIDCredentials()

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
        [inputDescriptorId: string]: string
      }
    | undefined = useMemo(
    () =>
      submission?.entries.reduce((acc, entry) => {
        if (entry.isSatisfied) {
          //TODO: Support multiplae credentials
          return { ...acc, [entry.inputDescriptorId]: entry.credentials[0].id }
        }
        return acc
      }, {}),
    [submission]
  )

  useEffect(() => {
    async function fetchCreds() {
      if (!selectedCredentials) return

      const creds: W3cCredentialRecord[] = []
      for (const [inputDescriptorID, credentialId] of Object.entries(selectedCredentials)) {
        const credential = await getCredentialById(credentialId)
        if (credential && inputDescriptorID) {
          creds.push(credential as W3cCredentialRecord)
        }
      }
      setCredentialsRequested(creds)
    }
    fetchCreds()
  }, [selectedCredentials, getCredentialById])

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

  const renderCard = (sub: FormattedSubmissionEntry, selectedCredential: FormattedSelectedCredentialEntry) => {
    const credential = credentialsRequested.find((c) => c.id === selectedCredential.id)
    if (!credential) {
      return null
    }
    const credentialDisplay = getCredentialForDisplay(credential)
    const fields = buildFieldsFromW3cCredsCredential(credentialDisplay)
    const requestedAttributes = selectedCredential.requestedAttributes
    const fieldsMapped = fields.filter((field) => requestedAttributes?.includes(field.name))

    return <CredentialCard credential={credential} displayItems={fieldsMapped as Attribute[]} />
  }

  const renderBody = () => {
    if (!submission) return null

    return (
      <View style={styles.credentialsList}>
        {submission.entries.map((s, i) => {
          //TODO: Support multiplae credentials
          const selectedCredential = s.credentials[0]

          return (
            <View key={i}>
              <OpenIDCredentialRowCard
                name={s.name}
                bgColor={selectedCredential.backgroundColor}
                txtColor={selectedCredential.textColor}
                bgImage={selectedCredential.backgroundImage?.url}
                issuer={verifierName}
                onPress={() => {}}
              />
              <View style={styles.cardContainer}>
                {s.isSatisfied && selectedCredential?.requestedAttributes ? (
                  renderCard(s, selectedCredential)
                ) : (
                  <Text style={TextTheme.normal}>{t('ProofRequest.CredentialNotInWallet')}</Text>
                )}
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
    )
  }

  return (
    <SafeAreaView style={{ flexGrow: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView>
        <View style={styles.pageContent}>
          {renderHeader()}
          {submission?.purpose && <Text style={TextTheme.labelSubtitle}>{submission.purpose}</Text>}
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
    </SafeAreaView>
  )
}

export default OpenIDProofPresentation
