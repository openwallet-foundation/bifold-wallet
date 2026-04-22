import { useAgent } from '@bifold/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter, View, StyleSheet, Text } from 'react-native'

import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { EventTypes } from '../../../constants'
import ScreenLayout from '../../../layout/ScreenLayout'
import ProofRequestAccept from '../../../screens/ProofRequestAccept'
import { BifoldError } from '../../../types/error'
import { DeliveryStackParams, Screens, TabStacks } from '../../../types/navigators'
import { ModalUsage } from '../../../types/remove'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import OpenIdProofRequestDisplay from '../features/OpenIDProofPresentation/OpenIDProofRequestDisplay'
import { useTheme } from '../../../contexts/theme'
import { formatOpenIdProofRequest } from '../displayProof'
import { shareProof } from '../resolverProof'
import { OpenIDCredentialRecord } from '../credentialRecord'

type OpenIDProofPresentationProps = StackScreenProps<DeliveryStackParams, Screens.OpenIDProofPresentation>

type SatisfiedCredentialsFormat = {
  [inputDescriptorId: string]: {
    id: string
    claimFormat: string
  }[]
}

type SelectedCredentialsFormat = {
  [inputDescriptorId: string]: {
    id: string
    claimFormat: string
  }
}

const OpenIDProofPresentation: React.FC<OpenIDProofPresentationProps> = ({
  navigation,
  route: {
    params: { credential },
  },
}: OpenIDProofPresentationProps) => {
  const { TextTheme } = useTheme()
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [credentialsRequested, setCredentialsRequested] = useState<Array<OpenIDCredentialRecord>>([])
  const [satistfiedCredentialsSubmission, setSatistfiedCredentialsSubmission] = useState<SatisfiedCredentialsFormat>()
  const [selectedCredentialsSubmission, setSelectedCredentialsSubmission] = useState<SelectedCredentialsFormat>()

  const { getCredentialById } = useOpenIDCredentials()

  const { t } = useTranslation()
  const { agent } = useAgent()

  const toggleDeclineModalVisible = () => setDeclineModalVisible(!declineModalVisible)

  const submission = useMemo(() => (credential ? formatOpenIdProofRequest(credential) : undefined), [credential])

  //This should run only once when the screen is mounted
  useEffect(() => {
    if (!submission) return
    const creds = submission.entries.reduce((acc: SatisfiedCredentialsFormat, entry) => {
      acc[entry.inputDescriptorId] = entry.credentials.map((cred) => ({
        id: cred.id,
        claimFormat: cred.claimFormat,
      }))
      return acc
    }, {})
    setSatistfiedCredentialsSubmission(creds)
  }, [submission])

  //Fetch all credentials satisfying the proof
  useEffect(() => {
    async function fetchCreds() {
      if (!satistfiedCredentialsSubmission || satistfiedCredentialsSubmission.entries) return
      const creds: Array<OpenIDCredentialRecord> = []

      for (const [inputDescriptorID, credIDs] of Object.entries(satistfiedCredentialsSubmission)) {
        for (const { id } of credIDs) {
          const credential = await getCredentialById(id)

          if (credential && inputDescriptorID) {
            creds.push(credential)
          }
        }
      }
      setCredentialsRequested(creds)
    }
    fetchCreds()
  }, [satistfiedCredentialsSubmission, getCredentialById])

  //Once satisfied credentials are set and all credentials fetched, we select the first one of each submission to display on screen
  useEffect(() => {
    if (!satistfiedCredentialsSubmission || credentialsRequested?.length <= 0) return

    const creds = Object.entries(satistfiedCredentialsSubmission).reduce(
      (acc: SelectedCredentialsFormat, [inputDescriptorId, credentials]) => {
        acc[inputDescriptorId] = {
          id: credentials[0]?.id,
          claimFormat: credentials?.[0]?.claimFormat,
        }
        return acc
      },
      {}
    )
    setSelectedCredentialsSubmission(creds)
  }, [satistfiedCredentialsSubmission, credentialsRequested])

  const { verifierName } = useMemo(() => {
    return { verifierName: credential?.verifierHostName }
  }, [credential])

  const handleAcceptTouched = async () => {
    try {
      if (!agent || !selectedCredentialsSubmission) {
        return
      }
      await shareProof({
        agent,
        requestRecord: credential,
        selectedProofCredentials: selectedCredentialsSubmission,
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
  }

  const handleDismiss = async () => {
    toggleDeclineModalVisible()
    navigation.getParent()?.navigate(TabStacks.HomeStack, { screen: Screens.Home })
  }

  // Re-construct the selected credentials object based on user alt credential
  const onCredChange = ({
    inputDescriptorID,
    id,
    claimFormat,
  }: {
    inputDescriptorID: string
    id: string
    claimFormat: string
  }) => {
    setSelectedCredentialsSubmission((prev) => ({
      ...prev,
      [inputDescriptorID]: {
        id,
        claimFormat,
      },
    }))
  }

  const handleAltCredChange = useCallback(
    (inputDescriptorID: string, selectedCredID: string, inputDescriptor: string) => {
      const submissionEntries = submission?.entries.find((entry) => entry.id === inputDescriptor)
      const credsForEntry = submissionEntries?.credentials

      if (!credsForEntry) return

      navigation.navigate(Screens.OpenIDProofCredentialSelect, {
        inputDescriptorID: inputDescriptorID,
        selectedCredID: selectedCredID,
        altCredIDs: credsForEntry.map((cred) => {
          return {
            id: cred.id,
            claimFormat: cred.claimFormat,
          }
        }),
        onCredChange: onCredChange,
      })
    },
    [submission, navigation]
  )

  const styles = StyleSheet.create({
    headerContainer: {
      paddingVertical: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
  })

  return (
    <ScreenLayout screen={Screens.OpenIDProofPresentation}>
      <View style={styles.headerContainer}>
        <Text style={TextTheme.headerTitle}>{t('ProofRequest.OID4VCTitle')}</Text>
      </View>
      <OpenIdProofRequestDisplay
        buttonsVisible={buttonsVisible}
        credential={credential}
        credentialsRequested={credentialsRequested}
        onPressAltCredChange={handleAltCredChange}
        onPressAccept={handleAcceptTouched}
        onPressDecline={handleDeclineTouched}
        onPressDismiss={handleDismiss}
        selectedCredentialsSubmission={selectedCredentialsSubmission}
        submission={submission}
        verifierName={verifierName}
      />
      <ProofRequestAccept visible={acceptModalVisible} proofId={''} confirmationOnly={true} />
      <CommonRemoveModal
        usage={ModalUsage.ProofRequestDecline}
        visible={declineModalVisible}
        onSubmit={handleDismiss}
        onCancel={toggleDeclineModalVisible}
      />
    </ScreenLayout>
  )
}

export default OpenIDProofPresentation
