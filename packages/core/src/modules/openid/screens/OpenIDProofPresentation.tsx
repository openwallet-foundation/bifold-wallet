import { useAgent } from '@bifold/react-hooks'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DeviceEventEmitter } from 'react-native'
import { MdocRecord, SdJwtVcRecord, W3cCredentialRecord } from '@credo-ts/core'

import CommonRemoveModal from '../../../components/modals/CommonRemoveModal'
import { EventTypes } from '../../../constants'
import ScreenLayout from '../../../layout/ScreenLayout'
import ProofRequestAccept from '../../../screens/ProofRequestAccept'
import { BifoldError } from '../../../types/error'
import { DeliveryStackParams, Screens, TabStacks } from '../../../types/navigators'
import { ModalUsage } from '../../../types/remove'
import { useOpenIDCredentials } from '../context/OpenIDCredentialRecordProvider'
import { formatDifPexCredentialsForRequest } from '../displayProof'
import { shareProof } from '../resolverProof'
import { isSdJwtProofRequest, isW3CProofRequest } from '../utils/utils'
import OpenIdProofRequestDisplay from '../features/OpenIDProofPresentation/OpenIDProofRequestDisplay'

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
  const [declineModalVisible, setDeclineModalVisible] = useState(false)
  const [buttonsVisible, setButtonsVisible] = useState(true)
  const [acceptModalVisible, setAcceptModalVisible] = useState(false)
  const [credentialsRequested, setCredentialsRequested] = useState<
    Array<W3cCredentialRecord | SdJwtVcRecord | MdocRecord>
  >([])
  const [satistfiedCredentialsSubmission, setSatistfiedCredentialsSubmission] = useState<SatisfiedCredentialsFormat>()
  const [selectedCredentialsSubmission, setSelectedCredentialsSubmission] = useState<SelectedCredentialsFormat>()

  const { getW3CCredentialById, getSdJwtCredentialById } = useOpenIDCredentials()

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
      const creds: Array<W3cCredentialRecord | SdJwtVcRecord | MdocRecord> = []

      for (const [inputDescriptorID, credIDs] of Object.entries(satistfiedCredentialsSubmission)) {
        for (const { id, claimFormat } of credIDs) {
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
      }
      setCredentialsRequested(creds)
    }
    fetchCreds()
  }, [satistfiedCredentialsSubmission, getW3CCredentialById, getSdJwtCredentialById])

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
      if (!agent || !credential.credentialsForRequest || !selectedCredentialsSubmission) {
        return
      }
      await shareProof({
        agent,
        authorizationRequest: credential.authorizationRequestPayload,
        credentialsForRequest: credential.credentialsForRequest,
        selectedCredentials: selectedCredentialsSubmission,
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
      const submittionEntries = submission?.entries.find((entry) => entry.inputDescriptorId === inputDescriptor)
      const credsForEntry = submittionEntries?.credentials

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

  return (
    <ScreenLayout screen={Screens.OpenIDCredentialDetails}>
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
        onSubmit={handleDeclineTouched}
        onCancel={toggleDeclineModalVisible}
      />
    </ScreenLayout>
  )
}

export default OpenIDProofPresentation
