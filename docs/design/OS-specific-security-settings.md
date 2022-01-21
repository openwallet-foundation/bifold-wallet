# 0. Document Intent

This document is currently in an early stage. It is intended to drive design and thinking that pushes developers of Aries Bifold applications. Over time this document should mature as various organizations deploy secure wallet applications and contribute back here.

# 1.0 Overarching Design and Constraints

## 1.1 OWASP MASVS

Consider [OWASP MASVS](https://github.com/OWASP/owasp-masvs) and what level your solution requires. MASVS provides three main levels that are additive:

- Baseline (L1)
- Defence in Depth (L2)
- Resilience (L2+R) - adds in client-side threat considerations.

## 1.2 Backup/Recovery

Due to security, backup and recovery of the wallet should be DISABLED. The ability to copy a wallet to another device is not supported. This stops the application from copying data to cloud storage.

## 1.3 Biometric Support

Locking a device down to only require a biometric creates a distinct possibility of permanently locking out a user. Instead, consider the following:

- Store SEED and other key secrets behind an Application Password (PIN) enforced KeyChain/KeyStore; AND
- Store a value that is protected by the current biometrics to test to see if anything has changes. For example on iOS there is a [`biometryCurrentSet`](https://developer.apple.com/documentation/security/secaccesscontrolcreateflags/2937192-biometrycurrentset) property for protecting KeyChain items that locks data to the current set of biometrics.
  > Touch ID must be available and enrolled with at least one finger, or Face ID available and enrolled. The item is invalidated if fingers are added or removed for Touch ID, or if the user re-enrolls for Face ID. [source: Apple](https://developer.apple.com/documentation/security/secaccesscontrolcreateflags/2937192-biometrycurrentset)

Consider allowing device passcode-based device unlocking or forcing a biometric check. An example is the `Keychain.BIOMETRY_TYPE` from [React Native Keychain library](https://github.com/oblador/react-native-keychain#keychainbiometry_type-enum) - goal is to disallow device passcode as a design constraint (if required).

# 2.0 General Requirements

## 2.1 Biometrics and Application PIN/Password

- The application MUST have biometrics enabled.
- The application MUST use an application PIN/password to protect critical items.
- The application SHOULD unlock with biometrics.
- The application MUST limit the types of biometrics it supports.
- The application MUST NOT allow data to be backed up remotely or to a locally installed cloud service.
- The application MUST protect secrets in the device KeyChain/KeyStore.
- The system MAY require biometric locking of the device KeyChain/KeyStore.

## 2.2 Security By Design

Using the [OWASP MASVS](https://github.com/OWASP/owasp-masvs) guidance consider the L2+R usages.

## 2.3 iOS Detail

Requirements:

- The application MUST ensure that the application PIN/password is used if the biometric lock on the device have changed (addition/removal of Touch ID digit or Face ID).
- The application MUST NOT use [`biometryAny`](https://developer.apple.com/documentation/security/secaccesscontrolcreateflags/2937191-biometryany). From Apple:

> Touch ID must be available and enrolled with at least one finger, or Face ID must be available and enrolled. **The item is still accessible by Touch ID if fingers are added or removed**, or by Face ID if the user is re-enrolled. [source: Apple](https://developer.apple.com/documentation/security/secaccesscontrolcreateflags/2937191-biometryany)

- Backup Disabling - use `*_THIS_DEVICE_ONLY` for [`Keychain.ACCESSIBLE`](https://developer.apple.com/documentation/security/ksecattraccessiblewhenunlocked) on iOS.

## 2.4 Android Detail

Requirements:

- The application SHOULD protect secrets in the device KeyStore. This means the device must use **BIOMETRIC_STRONG (Class 3)** (see [Android Biometric Sensor Class](https://source.android.com/security/biometric) for more detail).
  - NOTE that Android 10.0 may be the minimum version that differentiates `BIOMETRIC_STRONG` from other biometrics. This may limit acceptability to Android 10+ for higher assurance use cases.
- The application MUST use only Class 3/Strong biometrics.
- The application MAY limit the types of biometrics that are supported. See [Keychain.BIOMETRIC_TYPE](https://github.com/oblador/react-native-keychain#keychainbiometry_type-enum) for detail.
- Backup Disabling - more information/research required.
