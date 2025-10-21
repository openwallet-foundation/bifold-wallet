import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'

import { BrandingOverlay } from '@bifold/oca'
import { BrandingOverlayType, CredentialOverlay, OCABundleResolveAllParams } from '@bifold/oca/build/legacy'
import {
  ClaimFormat,
  MdocRecord,
  MdocRepository,
  SdJwtVcRecord,
  SdJwtVcRepository,
  W3cCredentialRecord,
  W3cCredentialRepository,
} from '@credo-ts/core'
import { useAgent } from '@credo-ts/react-hooks'
import { recordsAddedByType, recordsRemovedByType } from '@credo-ts/react-hooks/build/recordUtils'
import { useTranslation } from 'react-i18next'
import { TOKENS, useServices } from '../../../container-api'
import { buildFieldsFromW3cCredsCredential } from '../../../utils/oca'
import { getCredentialForDisplay } from '../display'
import { OpenIDCredentialType, RefreshResponse } from '../types'
import { getListFromStatusListJWT, getStatusListFromJWT, StatusListEntry } from '@sd-jwt/jwt-status-list'
import { decode, encode } from 'base-64'
import { gunzip } from 'react-zlib-js'
import { getRefreshCredentialMetadata, setRefreshCredentialMetadata } from '../refresh/refreshMetadata'

type OpenIDCredentialRecord = W3cCredentialRecord | SdJwtVcRecord | MdocRecord | undefined

function gunzipAsync(buffer: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    gunzip(buffer, (err: any, result: Uint8Array) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

const sampleStJwt =
  'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyIn0.eyJleHAiOjIyOTE3MjAxNzAsImlhdCI6MTc1NjQwNTAwNCwic3RhdHVzX2xpc3QiOnsiYml0cyI6MSwibHN0IjoiZU5ydDNBRU53Q0FNQUVHb2drbEFDdEtRUGc5THVnQzlrX0FDdnJlaW9nRUFBS2tlQ1FBQUFBQUFBQUFBQUFBQUFBQUFBSUJ5bGdRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFYRzlJQUFBQUFBQUFBUHdzSkFBQUFBQUFBQUFBQUFBQXZoc1NBQUFBQUFBQUFBQUE3S3BMQUFBQUFBQUFBQUFBQUFBQUFBQUFBSnNMQ1FBQUFBQUFBQUFBQURqZWxBQUFBQUFBQUFBQUtqRE1BUUFBQUFDQVpDOEwyQUViIn0sInN1YiI6Imh0dHBzOi8vZXhhbXBsZS5jb20vc3RhdHVzbGlzdHMvMSIsInR0bCI6NDMyMDB9.sOhaLjcB6xTwSuoSDy4Y7ccYPj8QAt3Plf163XoUMLcqzMz0Ge994aWnnynG62gSw9mBrKfwQB_p1ztRBMb5KA'

export type OpenIDCredentialContext = {
  openIdState: OpenIDCredentialRecordState
  getW3CCredentialById: (id: string) => Promise<W3cCredentialRecord | undefined>
  getSdJwtCredentialById: (id: string) => Promise<SdJwtVcRecord | undefined>
  getMdocCredentialById: (id: string) => Promise<MdocRecord | undefined>
  storeCredential: (cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord) => Promise<void>
  removeCredential: (
    cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord,
    type: OpenIDCredentialType
  ) => Promise<void>
  resolveBundleForCredential: (
    credential: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
  ) => Promise<CredentialOverlay<BrandingOverlay>>
  verifyCredential: (credential: SdJwtVcRecord) => Promise<boolean>
  checkNewCredentialForRecord: (
    cred: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
  ) => Promise<RefreshResponse | undefined>
}

export type OpenIDCredentialRecordState = {
  openIDCredentialRecords: Array<OpenIDCredentialRecord>
  w3cCredentialRecords: Array<W3cCredentialRecord>
  sdJwtVcRecords: Array<SdJwtVcRecord>
  mdocVcRecords: Array<MdocRecord>
  isLoading: boolean
}

const addW3cRecord = (record: W3cCredentialRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.w3cCredentialRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    w3cCredentialRecords: newRecordsState,
  }
}

const removeW3cRecord = (
  record: W3cCredentialRecord,
  state: OpenIDCredentialRecordState
): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.w3cCredentialRecords]
  const index = newRecordsState.findIndex((r) => r.id === record.id)
  if (index > -1) {
    newRecordsState.splice(index, 1)
  }

  return {
    ...state,
    w3cCredentialRecords: newRecordsState,
  }
}

const addSdJwtRecord = (record: SdJwtVcRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.sdJwtVcRecords]
  newRecordsState.unshift(record)

  return {
    ...state,
    sdJwtVcRecords: newRecordsState,
  }
}

const removeSdJwtRecord = (record: SdJwtVcRecord, state: OpenIDCredentialRecordState): OpenIDCredentialRecordState => {
  const newRecordsState = [...state.sdJwtVcRecords]
  const index = newRecordsState.findIndex((r) => r.id === record.id)
  if (index > -1) {
    newRecordsState.splice(index, 1)
  }

  return {
    ...state,
    sdJwtVcRecords: newRecordsState,
  }
}

const defaultState: OpenIDCredentialRecordState = {
  openIDCredentialRecords: [],
  w3cCredentialRecords: [],
  sdJwtVcRecords: [],
  mdocVcRecords: [],
  isLoading: true,
}

interface OpenIDCredentialProviderProps {
  children: React.ReactNode
}

const OpenIDCredentialRecordContext = createContext<OpenIDCredentialContext>(null as unknown as OpenIDCredentialContext)

const isW3CCredentialRecord = (record: W3cCredentialRecord) => {
  return record.getTags()?.claimFormat === ClaimFormat.JwtVc
}

const isSdJwtCredentialRecord = (record: SdJwtVcRecord) => {
  return 'compactSdJwtVc' in record
}

const filterW3CCredentialsOnly = (credentials: W3cCredentialRecord[]) => {
  return credentials.filter((r) => isW3CCredentialRecord(r))
}

const filterSdJwtCredentialsOnly = (credentials: SdJwtVcRecord[]) => {
  return credentials.filter((r) => isSdJwtCredentialRecord(r))
}

// eslint-disable-next-line react/prop-types
export const OpenIDCredentialRecordProvider: React.FC<PropsWithChildren<OpenIDCredentialProviderProps>> = ({
  children,
}: OpenIDCredentialProviderProps) => {
  const [state, setState] = useState<OpenIDCredentialRecordState>(defaultState)

  const { agent } = useAgent()
  const [logger, bundleResolver] = useServices([TOKENS.UTIL_LOGGER, TOKENS.UTIL_OCA_RESOLVER])
  const { i18n } = useTranslation()

  function checkAgent() {
    if (!agent) {
      const error = 'Agent undefined!'
      logger.error(`[OpenIDCredentialRecordProvider] ${error}`)
      throw new Error(error)
    }
  }

  async function getW3CCredentialById(id: string): Promise<W3cCredentialRecord | undefined> {
    console.log('$$ Getting W3C Credential by ID:', id)
    checkAgent()
    const cred = await agent?.w3cCredentials.getCredentialRecordById(id)
    verifyCredential(cred)
    return cred
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const verifyCredentialMock = async (credential: SdJwtVcRecord): Promise<boolean> => {
    try {
      const compactSdJwt = credential.compactSdJwtVc

      console.log('===========> jwt', compactSdJwt)

      // Step 2: Split JWT parts
      const [headerB64, payloadB64, signatureB64, ...disclosures] = compactSdJwt.split('.')

      console.log('===========> headerB64', headerB64)
      console.log('===========> payloadB64', payloadB64)
      console.log('===========> signatureB64', signatureB64)
      console.log('===========> Decoding ...')

      const header = JSON.parse(decode(headerB64))
      const payload = JSON.parse(decode(payloadB64))

      console.log('===========> header', header)
      console.log('===========> payload', payload)

      payload.status = {
        status_list: {
          idx: 0, // example index
          uri: 'http://localhost:8080/statuslist.jwt',
        },
      }

      const newPayloadB64 = encode(JSON.stringify(payload))
      const newCompactJwt = [headerB64, newPayloadB64, signatureB64, ...disclosures].join('.')

      console.log('===========> newPayloadB64', newPayloadB64)
      console.log('===========> newCompactJwt', newCompactJwt)
      console.log('===========>Verifying New JWT ========> ')

      // const verifyResult = await agent?.sdJwtVc.verify({
      //   compactSdJwtVc: credential.compactSdJwtVc,
      // })
      // console.log('===========> verifyResult', JSON.stringify(verifyResult))
      const reference = getStatusListFromJWT(newCompactJwt)

      console.log('===========> status list from new jwt', JSON.stringify(reference))

      console.log('===========> List URI', JSON.stringify(reference.uri))

      const response = await fetch(reference.uri)
      if (!response.ok) {
        throw new Error(`Failed to fetch status list: ${response.statusText}`)
      }

      const jwt = await response.text()

      console.log('===========> List JWT', jwt)

      const statusList = getListFromStatusListJWT(jwt)

      console.log('===========> statusList', JSON.stringify(statusList))

      //get the status of a specific entry
      const status = statusList.getStatus(reference.idx)

      console.log('===========> status', status)
      return status === 0
    } catch (error) {
      console.error(` =>>>> [OpenIDCredentialRecordProvider] Error verifying credential: ${error}`)
      throw error
    }
  }

  function pad(val: string): string {
    // Pad base64 values if need be: JWT calls to omit trailing padding.
    const padlen = 4 - (val.length % 4)
    return padlen > 2 ? val : val + '='.repeat(padlen)
  }

  const tryDecode = async (statusListCredential: string, idx: number) => {
    // logger.info(' %%%%%%%%%%%%%%%%%%%%% Status List Credential:', statusListCredential)
    // const response = await fetch(ref.uri)
    // const statusListCredential = await response.text()
    console.debug('Status List Credential:', statusListCredential)

    // Decode statusListCredential from JWT format
    // const statusListJson = JSON.parse(Buffer.from(statusListCredential.split('.')[1], 'base64').toString())
    // console.debug('Decoded Status List Credential:', statusListJson)
    // const encodedStatusList = statusListJson['status_list']['lst']
    // console.debug('Encoded Status List:', { encodedStatusList })
    const test =
      'eNrt3AENwCAMAEGogklACtKQPg9LugC9k_ACvreiogEAAKkeCQAAAAAAAAAAAAAAAAAAAIBylgQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXG9IAAAAAAAAAPwsJAAAAAAAAAAAAAAAvhsSAAAAAAAAAAAA7KpLAAAAAAAAAAAAAAAAAAAAAJsLCQAAAAAAAAAAADjelAAAAAAAAAAAKjDMAQAAAACAZC8L2AEb'
    const paddedStatusList = pad(test)
    console.debug('Padded Status List:', { paddedStatusList })
    const compressedBuffer = Buffer.from(paddedStatusList, 'base64')
    const decompressedBuffer = await gunzipAsync(compressedBuffer)
    console.debug('Decompressed Buffer:', decompressedBuffer)
    const statusList = decompressedBuffer
    let bitstring = ''

    // Convert each byte to its 8-bit binary representation
    for (let i = 0; i < statusList.length; i++) {
      bitstring += statusList[i].toString(2).padStart(8, '0')
    }
    console.debug('Bitstring length:', { length: bitstring.length })

    const bitIndex = idx
    console.debug('Bit Index:', { bitIndex })
    const byteIndex = Math.floor(bitIndex / 8)
    const bitPosition = bitIndex % 8
    const byte = statusList[byteIndex]
    const bitValue = (byte >> (7 - bitPosition)) & 1
    console.debug('Bit Value:', { bitValue })
    const isValid = bitValue === 0

    return isValid
  }

  const verifyCredential = async (credential: SdJwtVcRecord | W3cCredentialRecord): Promise<boolean> => {
    try {
      // const compactSdJwt = credential.compactSdJwtVc
      const compactSdJwt =
        'eyJraWQiOiAiZGlkOndlYjp3cy5kZXYuaXNzdWVyLWFnZW50LmRpdGkuZGkuZ292Lm9uLmNhOmlzc3Vlcjp0cnVzdDpkaWR3ZWI6b2JyIzNDUDdoZFNRQmJldVNYNTZ3TFcxYmFWckNNUFp2TGJVdGlyUThrbVRWTGdrIiwgInR5cCI6ICJ2YytzZC1qd3QiLCAiYWxnIjogIkVkRFNBIn0.eyJfc2QiOiBbIjB5dzNLdzl1a1A5TmdjemRhczRsTW9oYkpiUnFMSGI5TW54NWhpaEdmMzAiLCAiRDBXMjgta0d6UHduRHJyUHJ3NkpYNHhCNS1mWXRRNmxvNEQ3TkYzSnVpRSIsICJIVFBfejFkdUZlT2Y4VlliU21oRUlIT2NHcjB2c0NWUzRRbFczYXV2THpNIiwgIklzU0N0c3VLci1xOUkxLVI4VjZMTENRczNOZUFmVHhCR0o5LTJjRk5wODgiLCAiVGVTWFg0VDRqRnhudnRuTHVHdXF3X3NJQUlzNjQzZDltNWIxYzMtbDZoMCIsICJjOUsxSXpyQ2pZczRwbXdhaS1WOWxQTGlRd2tCTU4zOU9tcmFvNkVDOVlZIiwgImsxMkdyT2ROeW9ORUFqdEJvcFFkQ19LLXhQRW1WWTdrc3MybEVHZ21VTlEiLCAicThFVWpDdzNVWDVKSGQ5a2ppTmpIOGV6QW9zc1JQbkhfekh6MXFnZ05lUSIsICJ0NHNzNVlYYWI3clk5N3hKLWQ5V0s3dGZOakVabUZqM1d2MlZNVlVzLW5FIiwgIngzZ3NZeFMteHdtTWlyWDNPek10WjRNWXFRS2dGUFYyZ3V0U0k3TWZUdWMiXSwgInN1YiI6ICJkaWQ6andrOmV5SnJkSGtpT2lKUFMxQWlMQ0pqY25ZaU9pSkZaREkxTlRFNUlpd2llQ0k2SW1kSVRXaE5SVXQ0YVZnMlRXZDJla2QxZGxjNE9YcERiREZ6VFhSckxXNW1hbGhxTUhSSU5HMVhja2tpZlEiLCAiY25mIjogeyJraWQiOiAiZGlkOmp3azpleUpyZEhraU9pSlBTMUFpTENKamNuWWlPaUpGWkRJMU5URTVJaXdpZUNJNkltZElUV2hOUlV0NGFWZzJUV2QyZWtkMWRsYzRPWHBEYkRGelRYUnJMVzVtYWxocU1IUklORzFYY2traWZRIzAifSwgInZjdCI6ICJCdXNpbmVzc0NhcmQiLCAiaXNzIjogImRpZDp3ZWI6d3MuZGV2Lmlzc3Vlci1hZ2VudC5kaXRpLmRpLmdvdi5vbi5jYTppc3N1ZXI6dHJ1c3Q6ZGlkd2ViOm9iciIsICJpYXQiOiAxNzYwOTk2NzY4LCAic3RhdHVzIjogeyJzdGF0dXNfbGlzdCI6IHsiaWR4IjogODc4NjIsICJ1cmkiOiAiaHR0cHM6Ly93cy5kZXYuaXNzdWVyLWFnZW50LmRpdGkuZGkuZ292Lm9uLmNhL2lzc3Vlci90cnVzdC9zdGF0dXNsaXN0L3RlbmFudHMvMGNjNmM0ZTYtM2VmYy00ODExLWJhNjQtZTk2ZTBiYzk4Yzc0L3N0YXR1cy80In19LCAiX3NkX2FsZyI6ICJzaGEtMjU2In0.ZK-LZliQSKbVf5Scen5EhkxDpdd19lFYSfEAk_EzFyFZIb0egVtEJtbNIhgzrUK4urXXqOjCOVM0Ut-WMnthCA~WyJsTlFPcndZUEpDNlZHV3N4MWM1a2VRIiwgImJ1c2luZXNzSWRlbnRpZmljYXRpb25OdW1iZXIiLCAiMTIzNCJd~WyJQRHlnRTJHenNtM0VlZE9CUTJ2RndRIiwgImJ1c2luZXNzTmFtZSIsICJFeGFtcGxlIENvcnAiXQ~WyJUTTRjamNQNG95RFBqVUtPRnZDa09RIiwgImJ1c2luZXNzVHlwZSIsICJMTEMiXQ~WyItRkEyNlBQVHNOUGtXMVYxYkNubk93IiwgInJlZ2lzdGVyZWRPbiIsICIyMDIzLTEwLTAxIl0~WyJpcXM4UXY1Tnp2dlN2VDZpUWRpM21BIiwgImNvbXBhbnlTdGF0dXMiLCAiQWN0aXZlIl0~WyJMRDBCTDNtdXFvRVlhcXhwZ3dBLUdBIiwgIm93bmVyIiwgIkFsaWNlIFNtaXRoIl0~WyJkNzhwZGE5bjN1cFN5Z1oxbnRCbHZBIiwgImFkZHJlc3MiLCAiMTIzIEV4YW1wbGUgU3QsIEV4YW1wbGUgQ2l0eSwgRVggMTIzNDUiXQ~WyJHWHdhZTBYRlJzaVVFdVpQWDlJY2h3IiwgInBob25lIiwgIjEyMy00NTYtNzg5MCJd~WyJya2lEQ3IyNWNrQTE1SFNpX0RKRk93IiwgImVtYWlsIiwgImFiY0BhYmMuY29tIl0~WyJhbkcxT1loT0lvWGpuWDFxS0N4emVRIiwgIndlYnNpdGUiLCAiaHR0cHM6Ly9leGFtcGxlLmNvbSJd~'
      console.log('===========>Verifying New JWT ========> ')

      console.log('===========> compact sd-jwt', compactSdJwt)

      //This is just a temporary hack to fix status list structure in DI lab
      const [headerB64, payloadB64, signatureB64, ...disclosures] = compactSdJwt.split('.')

      const header = JSON.parse(decode(headerB64))
      const payload = JSON.parse(decode(payloadB64))

      console.log('===========> header', header)
      console.log('===========> payload', payload)
      console.log('===========> status list', payload.status)

      payload.status = {
        status_list: payload.status,
      }

      const newPayloadB64 = encode(JSON.stringify(payload))
      const newCompactJwt = [headerB64, newPayloadB64, signatureB64, ...disclosures].join('.')

      // const verifyResult = await agent?.sdJwtVc.verify({
      //   compactSdJwtVc: credential.compactSdJwtVc,
      // })
      // logger.info('===========> verifyResult', JSON.stringify(verifyResult))
      //TODO: use this function back when credentials has the tag "status_list" instead of "status"

      const reference = getStatusListFromJWT(compactSdJwt)
      const entry = reference.idx

      console.log('===========> status list from new jwt', JSON.stringify(reference))
      console.log('===========> List URI', JSON.stringify(reference.uri))
      console.log('===========> Entry Index', JSON.stringify(entry))

      const response = await fetch(reference.uri)
      if (!response.ok) {
        throw new Error(`Failed to fetch status list: ${response.statusText}`)
      }

      const jwt = await response.text()

      const toUseJwt = jwt
      // const toUseJwt = sampleStJwt

      // const isCredValid = await tryDecode(toUseJwt, 1000345)

      // return false

      console.log('===========> List JWT', toUseJwt)

      const statusList = getListFromStatusListJWT(toUseJwt)

      // console.log('===========> statusList', statusList)

      //get the status of a specific entry
      const status = statusList.getStatus(entry)

      console.log('===========> status', status)
      const altIsCredValid = status === 0

      console.log('===========> Package based Credential Validity:', altIsCredValid)
      // console.log('===========> Custom Decode based Credential Validity:', isCredValid)

      return altIsCredValid
    } catch (error) {
      console.log(` =>>>> [OpenIDCredentialRecordProvider] Error verifying credential: ${error}`)
      throw error
    }
  }

  async function getSdJwtCredentialById(id: string): Promise<SdJwtVcRecord | undefined> {
    checkAgent()
    const cred = await agent?.sdJwtVc.getById(id)
    verifyCredential(cred)
    return cred
  }

  // async function verifySdJwtCredentialById(credential: SdJwtVcRecord): Promise<boolean | undefined> {
  //   const presentation = await agent?.sdJwtVc.verify(credential)
  // }

  async function getMdocCredentialById(id: string): Promise<MdocRecord | undefined> {
    checkAgent()
    return await agent?.mdoc.getById(id)
  }

  async function storeCredential(cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord): Promise<void> {
    checkAgent()
    if (cred instanceof W3cCredentialRecord) {
      await agent?.dependencyManager.resolve(W3cCredentialRepository).save(agent.context, cred)
    } else if (cred instanceof SdJwtVcRecord) {
      await agent?.dependencyManager.resolve(SdJwtVcRepository).save(agent.context, cred)
    } else if (cred instanceof MdocRecord) {
      await agent?.dependencyManager.resolve(MdocRepository).save(agent.context, cred)
    }
  }

  async function deleteCredential(cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord, type: OpenIDCredentialType) {
    checkAgent()
    if (type === OpenIDCredentialType.W3cCredential) {
      await agent?.w3cCredentials.removeCredentialRecord(cred.id)
    } else if (type === OpenIDCredentialType.SdJwtVc) {
      await agent?.sdJwtVc.deleteById(cred.id)
    } else if (type === OpenIDCredentialType.Mdoc) {
      await agent?.mdoc.deleteById(cred.id)
    }
  }

  async function checkNewCredentialForRecord(cred: W3cCredentialRecord | SdJwtVcRecord | MdocRecord) {
    logger.info(`[OpenIDCredentialRecordProvider] Checking new credential for record: ${cred.id}`)
    const refreshMetaData = getRefreshCredentialMetadata(cred)
    if (!refreshMetaData) {
      logger.error(`[OpenIDCredentialRecordProvider] No refresh metadata found for credential: ${cred.id}`)
      return
    }

    logger.info(`[OpenIDCredentialRecordProvider] Found refresh metadata for credential: ${cred.id}`)
    const { refreshToken, authServer } = refreshMetaData

    try {
      if (!authServer) {
        throw new Error('No authorization server found in the credential offer metadata')
      }

      logger.info(`[OpenIDCredentialRecordProvider] Found auth server for credential: ${cred.id}: ${authServer}`)

      // Build token endpoint: <AS>/token?force=false
      // React-Native-safe URL build
      const tokenUrl = (authServer.endsWith('/') ? authServer.slice(0, -1) : authServer) + '/token?force=false'
      // const tokenUrl = new URL('token', authServer)
      // tokenUrl.searchParams.set('force', 'false')

      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        // these are accepted by some ASs that share the same endpoint with pre-auth:
        pre_authorized_code: '',
        pre_authorized_code_alt: '',
        user_pin: '',
      })

      const res = await fetch(tokenUrl.toString(), {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Refresh failed ${res.status}: ${errText}`)
      }

      const data: RefreshResponse = await res.json()
      logger.info(`[OpenIDCredentialRecordProvider] New access token acquired: ${JSON.stringify(data)}`)

      // If refresh token rotated, persist it
      if (data.refresh_token && data.refresh_token !== refreshToken) {
        logger.info(`[OpenIDCredentialRecordProvider] Refresh token rotated; saving new one`)
        setRefreshCredentialMetadata(cred, {
          authServer: authServer,
          refreshToken: data.refresh_token,
        })
      }

      // If you want to immediately request a fresh credential using the new token:
      // await receiveCredentialFromOpenId4VciOffer({
      //   agent,
      //   resolvedCredentialOffer,
      //   accessToken: {
      //     accessToken: data.access_token,
      //     cNonce: data.c_nonce,
      //     accessTokenResponse: data as any,
      //   },
      // })

      // Return tokens so caller can proceed (e.g., to requestCredentials)
      return data
    } catch (error) {
      logger.error(`[OpenIDCredentialRecordProvider] Error getting new token: ${error}`)
      return
    }
  }

  const resolveBundleForCredential = async (
    credential: SdJwtVcRecord | W3cCredentialRecord | MdocRecord
  ): Promise<CredentialOverlay<BrandingOverlay>> => {
    const credentialDisplay = getCredentialForDisplay(credential)

    const params: OCABundleResolveAllParams = {
      identifiers: {
        schemaId: '',
        credentialDefinitionId: credentialDisplay.id,
      },
      meta: {
        alias: credentialDisplay.display.issuer.name,
        credConnectionId: undefined,
        credName: credentialDisplay.display.name,
      },
      attributes: buildFieldsFromW3cCredsCredential(credentialDisplay),
      language: i18n.language,
    }

    const bundle = await bundleResolver.resolveAllBundles(params)
    const _bundle = bundle as CredentialOverlay<BrandingOverlay>

    const brandingOverlay: BrandingOverlay = new BrandingOverlay('none', {
      capture_base: 'none',
      type: BrandingOverlayType.Branding10,
      primary_background_color: credentialDisplay.display.backgroundColor,
      background_image: credentialDisplay.display.backgroundImage?.url,
      logo: credentialDisplay.display.logo?.url,
    })
    const ocaBundle: CredentialOverlay<BrandingOverlay> = {
      ..._bundle,
      presentationFields: bundle.presentationFields,
      brandingOverlay: brandingOverlay,
    }

    return ocaBundle
  }

  useEffect(() => {
    if (!agent) {
      return
    }

    agent.w3cCredentials?.getAllCredentialRecords().then((w3cCredentialRecords) => {
      setState((prev) => ({
        ...prev,
        w3cCredentialRecords: filterW3CCredentialsOnly(w3cCredentialRecords),
        isLoading: false,
      }))
    })

    agent.sdJwtVc?.getAll().then((creds) => {
      setState((prev) => ({
        ...prev,
        sdJwtVcRecords: filterSdJwtCredentialsOnly(creds),
        isLoading: false,
      }))
    })
  }, [agent])

  useEffect(() => {
    if (!state.isLoading && agent) {
      const w3c_credentialAdded$ = recordsAddedByType(agent, W3cCredentialRecord).subscribe((record) => {
        //This handler will return ANY creds added to the wallet even DidComm
        //Sounds like a bug in the hooks package
        //This check will safe guard the flow untill a fix goes to the hooks
        if (isW3CCredentialRecord(record)) {
          setState(addW3cRecord(record, state))
        }
      })

      const w3c_credentialRemoved$ = recordsRemovedByType(agent, W3cCredentialRecord).subscribe((record) => {
        setState(removeW3cRecord(record, state))
      })

      const sdjwt_credentialAdded$ = recordsAddedByType(agent, SdJwtVcRecord).subscribe((record) => {
        //This handler will return ANY creds added to the wallet even DidComm
        //Sounds like a bug in the hooks package
        //This check will safe guard the flow untill a fix goes to the hooks
        setState(addSdJwtRecord(record, state))
        // if (isW3CCredentialRecord(record)) {
        //   setState(addW3cRecord(record, state))
        // }
      })

      const sdjwt_credentialRemoved$ = recordsRemovedByType(agent, SdJwtVcRecord).subscribe((record) => {
        setState(removeSdJwtRecord(record, state))
      })

      return () => {
        w3c_credentialAdded$.unsubscribe()
        w3c_credentialRemoved$.unsubscribe()
        sdjwt_credentialAdded$.unsubscribe()
        sdjwt_credentialRemoved$.unsubscribe()
      }
    }
  }, [state, agent])

  return (
    <OpenIDCredentialRecordContext.Provider
      value={{
        openIdState: state,
        storeCredential: storeCredential,
        removeCredential: deleteCredential,
        getW3CCredentialById: getW3CCredentialById,
        getSdJwtCredentialById: getSdJwtCredentialById,
        getMdocCredentialById: getMdocCredentialById,
        resolveBundleForCredential: resolveBundleForCredential,
        verifyCredential: verifyCredential,
        checkNewCredentialForRecord: checkNewCredentialForRecord,
      }}
    >
      {children}
    </OpenIDCredentialRecordContext.Provider>
  )
}

export const useOpenIDCredentials = () => useContext(OpenIDCredentialRecordContext)
