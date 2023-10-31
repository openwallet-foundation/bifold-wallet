package com.attestation

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.GooglePlayServicesUtil;
import com.google.android.gms.tasks.Task;
import com.google.android.play.core.integrity.IntegrityManager;
import com.google.android.play.core.integrity.IntegrityManagerFactory;
import com.google.android.play.core.integrity.IntegrityServiceException;
import com.google.android.play.core.integrity.IntegrityTokenRequest;
import com.google.android.play.core.integrity.IntegrityTokenResponse;

class AttestationModule : AttestationSpec {

  private val reactContext: ReactApplicationContext;
  private val baseContext: ReactApplicationContext;

  constructor(context: ReactApplicationContext) : super(context) {
    reactContext = context;
    baseContext = getReactApplicationContext();
  }

  override fun getName(): String {
    return NAME
  }

  companion object {
    const val NAME = "Attestation"
  }

  /**
   * Checks if Google Play Integrity API is available
   * See https://developer.android.com/google/play/integrity/overview
   *
   * @param promise
   */
  @ReactMethod
  override fun isPlayIntegrityAvailable(promise: Promise) {
    try {
      val apiAvailable = GooglePlayServicesUtil.isGooglePlayServicesAvailable(baseContext) == ConnectionResult.SUCCESS;
      promise.resolve(apiAvailable);
    } catch (e: Throwable) {
      promise.reject("Error checking Play Integrity availability", e)
    }
  }

  /**
   * Request an integrity verdict
   * See https://developer.android.com/google/play/integrity/verdict#request
   *
   * @param nonce
   * @param promise
   */
  @ReactMethod
  override fun googleAttestation(nonce: String, promise: Promise) {
    try {
      // Create an instance of a manager
      val integrityManager: IntegrityManager =
              IntegrityManagerFactory.create(baseContext)

      // Request the integrity token by providing a nonce
      val integrityTokenResponse: Task<IntegrityTokenResponse> =
              integrityManager.requestIntegrityToken(
                      IntegrityTokenRequest.builder()
                              .setNonce(nonce)
                              .build())

      // Success listener
      integrityTokenResponse.addOnSuccessListener { response: IntegrityTokenResponse -> promise.resolve(response.token()) };

      // Cancelled listener
      integrityTokenResponse.addOnCanceledListener { -> promise.reject("Integrity token request cancelled") };

      // Failure listener
      integrityTokenResponse.addOnFailureListener { e: Exception ->
        if (e is IntegrityServiceException) {
          promise.reject(e.getErrorCode().toString(), e)
        } else {
          promise.reject("Unexpected failure during integrity token request", e)
        }
      };

    } catch (e: Throwable) {
      promise.reject("Error requesting integrity token", e);
    }
  }
}