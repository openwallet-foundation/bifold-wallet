import type { CredentialFormatData } from './CredentialFormatDataProvider'
import type { ProofFormatData } from './ProofFormatDataProvider'

import AgentProvider, { useAgent } from './AgentProvider'
import { useBasicMessages, useBasicMessagesByConnectionId } from './BasicMessageProvider'
import { useConnections, useConnectionById } from './ConnectionProvider'
import { useCredentialsFormatData, useCredentialFormatDataById } from './CredentialFormatDataProvider'
import {
  useCredentials,
  useCredentialById,
  useCredentialByState,
  useCredentialNotInState,
  useCredentialsByConnectionId,
} from './CredentialProvider'
import { useExchanges, useExchangesByConnectionId } from './ExchangesProvider'
import { useProofsFormatData, useProofFormatDataById } from './ProofFormatDataProvider'
import { useProofs, useProofById, useProofByState, useProofNotInState, useProofsByConnectionId } from './ProofProvider'
import { useQuestionAnswer, useQuestionAnswerByConnectionId, useQuestionAnswerById } from './QuestionAnswerProvider'

export type { ProofFormatData, CredentialFormatData }

export {
  useAgent,
  useBasicMessages,
  useBasicMessagesByConnectionId,
  useConnections,
  useConnectionById,
  useCredentials,
  useCredentialById,
  useCredentialByState,
  useCredentialNotInState,
  useCredentialsByConnectionId,
  useProofs,
  useProofById,
  useProofByState,
  useProofNotInState,
  useQuestionAnswer,
  useQuestionAnswerByConnectionId,
  useQuestionAnswerById,
  useExchanges,
  useExchangesByConnectionId,
  useProofsByConnectionId,
  useProofsFormatData,
  useProofFormatDataById,
  useCredentialFormatDataById,
  useCredentialsFormatData,
}

export default AgentProvider
