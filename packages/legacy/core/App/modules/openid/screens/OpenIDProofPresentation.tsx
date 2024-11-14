import { useMemo, useState } from 'react'
import { DeviceEventEmitter } from 'react-native'
import { useAgent } from '@credo-ts/react-hooks'
import { useTranslation } from 'react-i18next'
import { StackScreenProps } from '@react-navigation/stack'
import { SafeAreaView } from 'react-native-safe-area-context'

import { DeliveryStackParams, Screens, TabStacks } from '../../../types/navigators'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { ListItems, TextTheme } from '../../../theme'
import { formatDifPexCredentialsForRequest } from '../displayProof'
import { testIdWithKey } from '../../../utils/testable'
import { sanitizeString } from '../utils/utils'
import { OpenIDCredentialRowCard } from '../components/CredentialRowCard'
import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { ModalUsage } from '../../../types/remove'
import Button, { ButtonType } from '../../../components/buttons/Button'
import { useTheme } from '../../../contexts/theme'
import { BifoldError } from '../../../types/error'
import { EventTypes } from '../../../constants'
import { shareProof } from '../resolverProof'
import ProofRequestAccept from '../../../screens/ProofRequestAccept'

type OpenIDProofPresentationProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDProofPresentation>

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
})

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

  const { ColorPallet } = useTheme()
  const { t } = useTranslation()
  const { agent } = useAgent()

  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)

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
          <Text style={TextTheme.title}>
            You have received an information request
            {verifierName ? ` from ${verifierName}` : ''}.
          </Text>
        </Text>
      </View>
    )
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
              <OpenIDCredentialRowCard name={s.name} issuer={verifierName} onPress={() => {}} />
              {s.isSatisfied && selectedCredential?.requestedAttributes ? (
                <View style={{ marginTop: 16, gap: 8 }}>
                  {s.description && <Text style={TextTheme.labelSubtitle}>{s.description}</Text>}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {selectedCredential.requestedAttributes.map((a) => (
                      <View key={a} style={{ flexBasis: '50%' }}>
                        <Text style={TextTheme.normal}>• {sanitizeString(a)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <Text style={TextTheme.title}>This credential is not present in your wallet.</Text>
              )}
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

      <ProofRequestAccept visible={acceptModalVisible} proofId={''} confirmationOnly = {true} />
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
