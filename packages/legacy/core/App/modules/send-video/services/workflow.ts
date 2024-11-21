import { Agent, BaseLogger, ConnectionRecord } from '@credo-ts/core'
import { BifoldError } from '@hyperledger/aries-bifold-core'
import { Subscription } from 'rxjs'
import { defaultResponseTimeoutInMs, requestStartSessionDrpc } from './drpc'
// import { AttestationRestrictions } from '../constants'
// import { removeExistingInvitationIfRequired } from '../helpers/BCIDHelper'
// import { credentialsMatchForProof } from '../helpers/credentials'
// import { AttestationRequestParams, AttestationResult, requestNonceDrpc, requestAttestationDrpc } from '../helpers/drpc'

export type AttestationMonitorOptions = {
  shouldHandleProofRequestAutomatically?: boolean
}

// type AttestationEventTypeKeys = keyof typeof AttestationEventTypes
// type AttestationEventTypeValues = (typeof AttestationEventTypes)[AttestationEventTypeKeys]
// type AttestationRestrictionsType = typeof AttestationRestrictions

export interface SendVideoServicesI {
  // readonly attestationWorkflowInProgress: boolean
  // shouldHandleProofRequestAutomatically: boolean
  start(agent: Agent): Promise<void>
  stop(): void
  startSession(): Promise<void>
}

type SendVideoServicesOptions = {
  sendVideoAgentInvitation: string
  sendVideoAPIBaseUrl: string
}

const SendVideoErrorCodes = {
  BadInvitation: 2027,
  ReceiveInvitationError: 2028,
  GeneralProofError: 2029,
  FailedToConnectToSendVideoAgent: 2030,
  FailedToFetchNonceForSendVideo: 2031,
  FailedToGenerateSendVideo: 2032,
  FailedToRequestSendVideo: 2033,
  FailedToValidateSendVideo: 2034,
} as const

const removeExistingInvitationIfRequired = async (agent: Agent | undefined, invitationId: string): Promise<void> => {
  try {
    // If something fails before we get the credential we need to
    // cleanup the old invitation before it can be used again.
    const oobRecord = await agent?.oob.findByReceivedInvitationId(invitationId)
    if (oobRecord) {
      await agent?.oob.deleteById(oobRecord.id)
    }
  } catch (error) {
    // findByInvitationId with throw if unsuccessful but that's not a problem.
    // It just means there is nothing to delete.
  }
}

export class SentVideoServices implements SendVideoServicesI {
  private options: SendVideoServicesOptions
  private agent?: Agent
  private log?: BaseLogger
  private connectionSubscription?: Subscription
  private connection?: ConnectionRecord
  private ready = false
  private blarb = false

  // take in options, agent, and logger. Options should include the attestation service URL
  // and the proof to watch for along with the cred_ef_id of the attestation credentials.
  public constructor(options: SendVideoServicesOptions, logger?: BaseLogger) {
    this.log = logger
    this.options = options
  }

  public async start(agent: Agent): Promise<void> {
    if (this.agent) {
      return
    }

    this.agent = agent

    // this.connectionSubscription = this.agent?.events
    //   .observable(ConnectionEventTypes.ConnectionStateChanged)
    //   .subscribe(this.handleConnectionStateChanged)

    this.connection = await this.connectToSendVideoAgent(this.options.sendVideoAgentInvitation)
  }

  public stop(): void {
    this.connectionSubscription?.unsubscribe()
  }

  public startSession = async () => {
    if (!this.agent || !this.connection) {
      return
    }

    const requestStartSessionCb = await requestStartSessionDrpc(this.agent, this.connection)
    const startSessionResponse = await requestStartSessionCb(defaultResponseTimeoutInMs)
    const { result } = startSessionResponse

    return result
  }

  private async connectToSendVideoAgent(invitationUrl: string): Promise<ConnectionRecord | undefined> {
    if (!this.agent) {
      throw new BifoldError(
        'Send Video Service',
        'There was a problem with the remote agent.',
        'The agent cannot be undefined.',
        SendVideoErrorCodes.ReceiveInvitationError
      )
    }

    const invite = await this.agent.oob.parseInvitation(invitationUrl)

    if (!invite) {
      this.log?.error('Unable to parse agent invitation')

      throw new BifoldError(
        'Attestation Service',
        'Unable to parse the send video agent invitation',
        'No details provided.',
        SendVideoErrorCodes.BadInvitation
      )
    }

    this.log?.info('Removing existing invitation if required')
    await removeExistingInvitationIfRequired(this.agent, invite.id)

    this.log?.info('Receiving invitation')
    const { connectionRecord } = await this.agent.oob.receiveInvitation(invite)
    if (!connectionRecord) {
      throw new BifoldError(
        'Attestation Service',
        'Unable to accept attestation agent invitation',
        'No details provided.',
        SendVideoErrorCodes.BadInvitation
      )
    }

    // this step will fail if there is more than one active connection record between a given wallet and
    // the traction instance which is why we need to `removeExistingInvitationIfRequired` above
    return await this.agent.connections.returnWhenIsConnected(connectionRecord.id)
  }
}
