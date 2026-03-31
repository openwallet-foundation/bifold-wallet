// modules/openid/refresh/verifyCredentialStatus.ts
import type { MdocRecord, SdJwtVcRecord, W3cCredentialRecord, W3cV2CredentialRecord } from '@credo-ts/core'
import { getListFromStatusListJWT, getStatusListFromJWT } from '@sd-jwt/jwt-status-list'
import type { BifoldLogger } from '../../../services/logger'
import { RefreshStatus } from './types'

type AnyCred = W3cCredentialRecord | SdJwtVcRecord | MdocRecord | W3cV2CredentialRecord

/**
 * Verifies credential status for Sd-JWT credentials using status lists.
 * Non–Sd-JWT credentials (W3C jwt_vc_json without status list, or mdoc) are treated as valid here.
 */
export async function verifyCredentialStatus(rec: AnyCred, logger?: BifoldLogger): Promise<RefreshStatus> {
  try {
    // Only Sd-JWT creds have compactSdJwtVc in this codebase
    if (!('compactSdJwtVc' in rec)) return RefreshStatus.Valid

    logger?.info(`[Verifier] Verifying credential status for Sd-JWT credential: ${rec.id}`)

    const ref = getStatusListFromJWT(rec.firstCredential.compact)
    const res = await fetch(ref.uri)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const jwt = await res.text()

    const list = getListFromStatusListJWT(jwt)
    const status = list.getStatus(ref.idx) === 0 ? RefreshStatus.Valid : RefreshStatus.Invalid

    logger?.info(`${status === RefreshStatus.Valid ? '✅' : '❌'} [Verifier] ${rec.id} → ${status}`)
    return status
  } catch (e) {
    logger?.error?.(`💥 [Verifier] ${'id' in rec ? rec.id : 'unknown'} verify failed: ${String(e)}`)
    return RefreshStatus.Error
  }
}
