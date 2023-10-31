package com.attestation

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise

abstract class AttestationSpec internal constructor(context: ReactApplicationContext) :
  ReactContextBaseJavaModule(context) {

  abstract fun isPlayIntegrityAvailable(promise: Promise)
  abstract fun googleAttestation(nonce: String, promise: Promise)
}
