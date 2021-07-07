/* eslint-disable @typescript-eslint/no-namespace */
import { CredentialsModule } from 'aries-framework'
import { createAsyncAgentThunk, ClassMethodParameters } from '../../utils'

/**
 * Namespace containing all **credential** related actions.
 */
namespace CredentialsThunks {
  /**
   * Retrieve all credential records
   */
  export const getAllCredentials = createAsyncAgentThunk('credentials/getAll', async (_, thunkApi) => {
    return thunkApi.extra.agent.credentials.getAll()
  })

  /**
   * Initiate a new credential exchange as holder by sending a credential proposal message
   * to the connection with the specified connection id.
   */
  export const proposeCredential = createAsyncAgentThunk(
    'credentials/proposeCredential',
    async (
      {
        connectionId,
        config,
      }: {
        connectionId: string
        config?: ClassMethodParameters<typeof CredentialsModule, 'proposeCredential'>[1]
      },
      thunkApi
    ) => {
      return thunkApi.extra.agent.credentials.proposeCredential(connectionId, config)
    }
  )

  /**
   * Accept a credential proposal as issuer (by sending a credential offer message) to the connection
   * associated with the credential record.
   */
  export const acceptProposal = createAsyncAgentThunk(
    'credentials/acceptProposal',
    async (
      {
        credentialId,
        config,
      }: {
        credentialId: string
        config?: ClassMethodParameters<typeof CredentialsModule, 'acceptProposal'>[1]
      },
      thunkApi
    ) => {
      return thunkApi.extra.agent.credentials.acceptProposal(credentialId, config)
    }
  )

  /**
   * Initiate a new credential exchange as issuer by sending a credential offer message
   * to the connection with the specified connection id.
   */
  export const offerCredential = createAsyncAgentThunk(
    'credentials/offerCredential',
    async (
      {
        connectionId,
        config,
      }: {
        connectionId: string
        config: ClassMethodParameters<typeof CredentialsModule, 'offerCredential'>[1]
      },
      thunkApi
    ) => {
      return thunkApi.extra.agent.credentials.offerCredential(connectionId, config)
    }
  )

  /**
   * Accept a credential offer as holder (by sending a credential request message) to the connection
   * associated with the credential record.
   */
  export const acceptOffer = createAsyncAgentThunk(
    'credentials/acceptOffer',
    async (
      {
        credentialId,
        config,
      }: {
        credentialId: string
        config?: ClassMethodParameters<typeof CredentialsModule, 'acceptOffer'>[1]
      },
      thunkApi
    ) => {
      return thunkApi.extra.agent.credentials.acceptOffer(credentialId, config)
    }
  )

  /**
   * Accept a credential request as issuer (by sending a credential message) to the connection
   * associated with the credential record.
   */
  export const acceptRequest = createAsyncAgentThunk(
    'credentials/acceptRequest',
    async (
      {
        credentialId,
        config,
      }: {
        credentialId: string
        config?: ClassMethodParameters<typeof CredentialsModule, 'acceptRequest'>[1]
      },
      thunkApi
    ) => {
      return thunkApi.extra.agent.credentials.acceptRequest(credentialId, config)
    }
  )

  /**
   * Accept a credential as holder (by sending a credential acknowledgement message) to the connection
   * associated with the credential record.
   */
  export const acceptCredential = createAsyncAgentThunk(
    'credentials/acceptCredential',
    async (credentialId: string, thunkApi) => {
      return thunkApi.extra.agent.credentials.acceptCredential(credentialId)
    }
  )
}

export { CredentialsThunks }
