package com.attestation

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext

abstract class AttestationSpec internal constructor(context: ReactApplicationContext) :
  NativeAttestationSpec(context) {

  override fun generateKey(cache: Boolean, promise: Promise) =
    promise.reject(UNSUPPORTED, "generateKey is only available on iOS")

  override fun sha256(stringToHash: String, promise: Promise) =
    promise.reject(UNSUPPORTED, "sha256 is only available on iOS")

  override fun appleAttestation(keyId: String, challenge: String, promise: Promise) =
    promise.reject(UNSUPPORTED, "appleAttestation is only available on iOS")

  override fun appleKeyAttestation(keyId: String, challenge: String, promise: Promise) =
    promise.reject(UNSUPPORTED, "appleKeyAttestation is only available on iOS")

  override fun getAppStoreReceipt(promise: Promise) =
    promise.reject(UNSUPPORTED, "getAppStoreReceipt is only available on iOS")

  private companion object {
    const val UNSUPPORTED = "E_PLATFORM_UNSUPPORTED"
  }
}
