package com.attestation

import com.facebook.react.bridge.ReactApplicationContext

abstract class AttestationSpec internal constructor(context: ReactApplicationContext) :
  NativeAttestationSpec(context) {
}
