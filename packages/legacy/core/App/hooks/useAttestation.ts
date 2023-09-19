import { useBasicMessages } from '@aries-framework/react-hooks'
import { generateKey, appleAttestationAsBase64 } from '@fullboar/react-native-attestation'
import { Buffer } from 'buffer'
import { Agent, BasicMessageRecord, BasicMessageRepository, BasicMessageRole } from '@aries-framework/core'
import { BasicMessageMetadata, BasicMessageCustomMetadata, InfrastructureMessageMetadata } from '../types/metadata'
import { handleInvalidNullResponse } from '@hyperledger/indy-vdr-react-native'

// const knownGoodKey = 'WeETO29AHUGytHO0wUBfW+y/2DWOJjYwG2Z9AP8bs0k='

enum Action {
  RequestAttestation = 'request_attestation',
  ChalangeResponse = 'chalange_response',
}

type InfrastructureMessage = {
  type: 'attestation'
  platform: 'apple'
  version: 1
  action: Action
}

type RequestIssuanceInfrastructureMessage = InfrastructureMessage & {
  nonce: string
}

type ChallangeResponseInfrastructureMessage = InfrastructureMessage & {
  key_id: string
  attestation_object: string
}

const markMessageAsProcessed = async (agent: Agent, record: BasicMessageRecord) => {
  const meta = record.metadata.get(BasicMessageMetadata.customMetadata) as InfrastructureMessageMetadata
  record.metadata.set(BasicMessageMetadata.customMetadata, { ...meta, processed: true, seen: true, hiden: true })
  const basicMessageRepository = agent.context.dependencyManager.resolve(BasicMessageRepository)
  await basicMessageRepository.update(agent.context, record)
}

const isInfrastuctureMessage = (record: BasicMessageRecord): boolean => {
  if (record.content) {
    try {
      const decoded = Buffer.from(record.content, 'base64').toString('utf-8')
      const encoded = Buffer.from(decoded).toString('base64')

      return encoded === record.content
    } catch (error) {
      return false
    }
  }

  return false
}

const customMetadataForMessage = (
  record: BasicMessageRecord
): (BasicMessageCustomMetadata & InfrastructureMessageMetadata) | null => {
  const meta = record.metadata.get(BasicMessageMetadata.customMetadata) as BasicMessageCustomMetadata &
    InfrastructureMessageMetadata

  return meta
}

const handleInfrastructureMessage = async (
  message: InfrastructureMessage
): Promise<ChallangeResponseInfrastructureMessage | null> => {
  switch (message.action) {
    case Action.RequestAttestation: {
      console.log('processing request for attestation')

      try {
        console.log('generating key')
        const keyId = await generateKey()
        // const keyId = knownGoodKey
        console.log('keyId = ', keyId)

        console.log('generating attestation')
        const attestationAsBuffer = await appleAttestationAsBase64(
          keyId,
          (message as RequestIssuanceInfrastructureMessage).nonce
        )
        const attestationResponse = {
          type: 'attestation',
          platform: 'apple',
          version: 1,
          action: Action.ChalangeResponse,
          key_id: keyId,
          attestation_object: attestationAsBuffer.toString('base64'),
        }
        console.log('returning attestation object')

        return attestationResponse
      } catch (error) {
        console.log('error X = ', error.message)
        return null
      }
    }

    default:
      return null
  }
}

export const useAttestation = async (agent: Agent): Promise<void> => {
  console.log('**************** useAttestation ****************')

  try {
    const { records } = useBasicMessages()
    console.log(`records count = ${records.length}`)

    const messages = records.filter((m) => isInfrastuctureMessage(m))

    console.log('***************************************')
    console.log(`messages count to process = ${messages.length}`)
    console.log('***************************************')

    for (const m of messages) {
      console.log(`processing message ${m.id}, role = ${m.role}`)

      if (m.role === BasicMessageRole.Sender) {
        agent?.basicMessages.deleteById(m.id)

        continue
      }

      const decoded = Buffer.from(m.content, 'base64').toString('utf-8')
      const message = JSON.parse(decoded)
      // console.log('message = ', message)
      const result = await handleInfrastructureMessage(message)
      // console.log('result = ', result)

      if (result) {
        const responseMessageContent = Buffer.from(JSON.stringify(result)).toString('base64')
        console.log('sending response message')
        await agent?.basicMessages.sendMessage(m.connectionId, responseMessageContent)
        console.log('sent response message')
      }

      // await markMessageAsProcessed(agent, m)
      console.log('deleting message')
      await agent?.basicMessages.deleteById(m.id)
      console.log('deleted message')
    }
  } catch (error) {
    console.log(error)
  }
}
