import { CredentialExchangeRecord, GetFormatDataReturn, IndyCredentialFormat, ProofRecord } from '@aries-framework/core'


const useCredentialByState = jest.fn().mockReturnValue([] as CredentialExchangeRecord[])
const useProofByState = jest.fn().mockReturnValue([] as ProofRecord[])
const mockCredentialModule = {
  acceptOffer: jest.fn(),
  declineOffer: jest.fn(),
  getFormatData: jest.fn().mockReturnValue(Promise.resolve({} as GetFormatDataReturn<[IndyCredentialFormat]>)),
}
const mockProofModule = {
  getRequestedCredentialsForProofRequest: jest.fn(),
  acceptRequest: jest.fn(),
  declineRequest: jest.fn(),
}
const useAgent = () => ({
  agent: {
    credentials: mockCredentialModule,
    proofs: mockProofModule,
  },
})
const useProofById = jest.fn()
const useConnectionById = jest.fn()

export default (credentials:CredentialExchangeRecord[]) => {
  const useCredentials = jest.fn().mockReturnValue({ credentials: [] } as any)
  const useCredentialById = () => {
    if (credentials !== undefined && credentials.length > 0){
      //console.log('calling useCredentialById, returning ', credentials)
      return credentials[0]
    }
    //console.log('calling useCredentialById, returning <undefined>')
    return undefined
  }
  // console.log('Mocking ...')
  return {
    useAgent,
    useConnectionById,
    useCredentials,
    useCredentialById,
    useCredentialByState,
    useProofById,
    useProofByState,
  }
}
