# Requirements: SSI-Compliant Backup & Restore

## 1. Overview

Memperbaiki implementasi backup & restore agar sesuai dengan standar Self-Sovereign Identity (SSI), khususnya prinsip **Portability** dan **Control**. Implementasi saat ini memiliki dependency pada keychain yang membuat backup tidak portable.

## 2. Problem Statement

### 2.1. Current Issues

**Critical Problems:**
1. ❌ Wallet key tidak derived dari mnemonic (melanggar BIP39)
2. ❌ Backup tidak self-contained (depend on keychain)
3. ❌ Tidak bisa restore di device baru tanpa keychain
4. ❌ Melanggar prinsip SSI: Control, Portability, Transparency

**Compliance Score:**
- SSI Principles: 7/10 (70%)
- Aries RFC 0050: 3/5 (60%)
- W3C DID Core: 0.5/3 (17%)
- BIP39 Standard: 0/3 (0%)
- **Overall: 50% - FAIL**

### 2.2. Root Cause

```typescript
// ❌ Current (Wrong):
const walletKey = hashPIN(pin)  // Not derived from mnemonic!

// ✅ Standard (Correct):
const walletKey = deriveFromMnemonic(mnemonic)  // Derived from mnemonic
```

**Impact:**
- User tidak bisa restore di device baru
- Backup tidak portable across platforms
- Melanggar standar SSI fundamental

## 3. User Stories

### 3.1. Primary User Stories

**US-1: Portable Backup**
```
As a wallet user
I want to restore my wallet on ANY device using only my backup file and mnemonic
So that I'm not locked to a single device or platform

Acceptance Criteria:
- User can restore wallet on new device with only backup + mnemonic
- No dependency on keychain from old device
- Works across iOS ↔ Android
- Works after app reinstall
```

**US-2: Mnemonic as Master Key**
```
As a wallet user
I want my mnemonic to be the master key for my wallet
So that I have full control over my identity

Acceptance Criteria:
- Wallet key is derived from mnemonic (BIP39 standard)
- Mnemonic alone is sufficient for full recovery
- Key derivation is transparent and auditable
- Compatible with other SSI wallets
```

**US-3: PIN for Convenience**
```
As a wallet user
I want to use PIN for daily access
So that I don't need to enter mnemonic every time

Acceptance Criteria:
- PIN encrypts mnemonic in keychain
- PIN is only for convenience, not security
- Can change PIN without affecting wallet
- Can access wallet with mnemonic if PIN forgotten
```

### 3.2. Migration User Stories

**US-4: Smooth Migration**
```
As an existing wallet user
I want to migrate to the new format without losing data
So that I can benefit from improved portability

Acceptance Criteria:
- Clear migration instructions
- No data loss during migration
- Can backup before migration
- Rollback option if needed
```

**US-5: Migration Timeline**
```
As a wallet user
I want sufficient time to migrate
So that I'm not forced to rush

Acceptance Criteria:
- 3 months advance notice
- Clear deadline communication
- Support during migration period
- Grace period for late migrators
```

## 4. Functional Requirements

### 4.1. Key Derivation (CRITICAL)

**FR-1: BIP39 Mnemonic Generation**
```
MUST generate 12-word BIP39 mnemonic
MUST use standard BIP39 wordlist
MUST include checksum validation
MUST be compatible with other BIP39 wallets
```

**FR-2: Master Key Derivation**
```
MUST derive master key from mnemonic using BIP39 standard
MUST use PBKDF2-SHA512 with 2048 iterations
MUST generate 512-bit seed
MUST be deterministic (same mnemonic → same key)
```

**FR-3: Wallet Key Derivation**
```
MUST derive wallet key from master key
MUST use standard derivation path (e.g., m/44'/0'/0'/0/0)
MUST support multiple wallets from same mnemonic
MUST be compatible with Aries Askar
```

### 4.2. Onboarding Flow

**FR-4: New Wallet Creation**
```
MUST generate mnemonic first
MUST derive wallet key from mnemonic
MUST create wallet with derived key
MUST display mnemonic to user for backup
MUST require user confirmation of backup
MUST allow user to set PIN for convenience
MUST encrypt mnemonic with PIN in keychain
```

**FR-5: Mnemonic Backup**
```
MUST show mnemonic in clear text
MUST allow user to copy mnemonic
MUST warn about security (write down, don't screenshot)
MUST require user to verify mnemonic (select words)
MUST not proceed until backup confirmed
```

### 4.3. Daily Access Flow

**FR-6: PIN-based Access**
```
MUST prompt for PIN on app open
MUST decrypt mnemonic from keychain using PIN
MUST derive wallet key from mnemonic
MUST open wallet with derived key
MUST handle wrong PIN (max 3 attempts)
MUST offer mnemonic recovery if PIN forgotten
```

**FR-7: Biometric Access**
```
SHOULD support biometric authentication
MUST use biometric to unlock keychain
MUST still derive key from mnemonic
MUST fallback to PIN if biometric fails
```

### 4.4. Backup Flow

**FR-8: Wallet Export**
```
MUST export wallet encrypted with mnemonic
MUST include all credentials, DIDs, connections
MUST use Aries Askar export format
MUST create zip file with database
MUST allow user to share/save backup file
```

**FR-9: Backup Verification**
```
SHOULD verify backup integrity after export
SHOULD test backup can be decrypted
SHOULD show backup size and date
SHOULD allow user to test restore (optional)
```

### 4.5. Restore Flow

**FR-10: Portable Restore**
```
MUST restore wallet using only backup file + mnemonic
MUST NOT depend on keychain from old device
MUST work on any device (iOS/Android)
MUST work after app reinstall
MUST derive wallet key from mnemonic
MUST import wallet with derived key
```

**FR-11: Post-Restore Setup**
```
MUST allow user to set new PIN
MUST encrypt mnemonic with new PIN
MUST store in keychain on new device
MUST reconnect to mediator
MUST verify all credentials present
```

### 4.6. Migration Flow

**FR-12: Old Wallet Detection**
```
MUST detect old wallet format on app start
MUST show migration prompt to user
MUST explain benefits of migration
MUST allow user to postpone (with deadline)
MUST track migration status
```

**FR-13: Migration Process**
```
MUST backup old wallet first
MUST export all data
MUST create new wallet with mnemonic-derived key
MUST import all data to new wallet
MUST verify data integrity
MUST delete old wallet after confirmation
MUST update keychain with new format
```

**FR-14: Migration Rollback**
```
SHOULD allow rollback if migration fails
SHOULD keep old wallet backup during grace period
SHOULD restore old wallet if user requests
SHOULD log migration errors for debugging
```

## 5. Non-Functional Requirements

### 5.1. Security

**NFR-1: Cryptographic Standards**
```
MUST use BIP39 for mnemonic generation
MUST use PBKDF2-SHA512 for key derivation
MUST use ChaCha20-Poly1305 for encryption
MUST use Argon2 for backup encryption
MUST follow NIST recommendations
```

**NFR-2: Key Storage**
```
MUST store encrypted mnemonic in keychain
MUST use platform secure storage (iOS Keychain, Android Keystore)
MUST never store mnemonic in plain text
MUST never log mnemonic or keys
MUST wipe keys from memory after use
```

**NFR-3: Backup Security**
```
MUST encrypt backup with strong KDF (Argon2)
MUST use authenticated encryption (AEAD)
MUST verify backup integrity on restore
MUST prevent tampering with MAC
```

### 5.2. Performance

**NFR-4: Key Derivation Performance**
```
SHOULD derive key in < 1 second on modern devices
SHOULD cache derived key in memory during session
SHOULD clear cache on app background
SHOULD optimize for battery life
```

**NFR-5: Restore Performance**
```
SHOULD complete restore in < 60 seconds for typical wallet
SHOULD show progress indicator
SHOULD allow cancellation
SHOULD handle large wallets (> 100 credentials)
```

### 5.3. Compatibility

**NFR-6: Platform Compatibility**
```
MUST work on iOS 13+
MUST work on Android 8+
MUST work on both 32-bit and 64-bit devices
MUST handle platform-specific keychain differences
```

**NFR-7: Wallet Compatibility**
```
SHOULD be compatible with other Aries wallets
SHOULD follow Aries RFC 0050 (Wallet)
SHOULD support standard derivation paths
SHOULD allow import from other wallets
```

### 5.4. Usability

**NFR-8: User Experience**
```
MUST provide clear instructions
MUST show progress during long operations
MUST handle errors gracefully
MUST provide helpful error messages
MUST support multiple languages
```

**NFR-9: Accessibility**
```
SHOULD support screen readers
SHOULD support large text
SHOULD support high contrast mode
SHOULD follow platform accessibility guidelines
```

## 6. Technical Constraints

### 6.1. Breaking Changes

**TC-1: Wallet Format Change**
```
⚠️ New wallet format is incompatible with old format
⚠️ Existing users must migrate
⚠️ Old wallets cannot be opened with new code
⚠️ Migration is one-way (cannot rollback after deadline)
```

**TC-2: Keychain Format Change**
```
⚠️ Keychain structure changes (now stores encrypted mnemonic)
⚠️ Old keychain data becomes obsolete
⚠️ Must migrate keychain during migration
```

### 6.2. Dependencies

**TC-3: Library Requirements**
```
MUST use bip39 library for mnemonic
MUST use @credo-ts/core for wallet operations
MUST use react-native-keychain for secure storage
MUST use Aries Askar for wallet storage
```

**TC-4: Platform Requirements**
```
MUST support iOS Keychain
MUST support Android Keystore
MUST handle platform-specific crypto APIs
MUST test on both platforms
```

## 7. Acceptance Criteria

### 7.1. Functional Acceptance

**AC-1: Portable Restore**
```
✅ User can restore wallet on new iOS device
✅ User can restore wallet on new Android device
✅ User can restore wallet after app reinstall
✅ User can restore wallet without old keychain
✅ Restore works with only backup + mnemonic
```

**AC-2: Key Derivation**
```
✅ Wallet key is derived from mnemonic
✅ Same mnemonic produces same wallet key
✅ Key derivation follows BIP39 standard
✅ Compatible with other BIP39 wallets
```

**AC-3: Migration**
```
✅ Existing users can migrate successfully
✅ No data loss during migration
✅ Migration completes in < 5 minutes
✅ Clear instructions provided
✅ Support available during migration
```

### 7.2. Compliance Acceptance

**AC-4: SSI Compliance**
```
✅ SSI Principles: 9/10 (90%+)
✅ Aries RFC 0050: 5/5 (100%)
✅ W3C DID Core: 3/3 (100%)
✅ BIP39 Standard: 3/3 (100%)
✅ Overall: 90%+ (PASS)
```

**AC-5: Security Compliance**
```
✅ Passes security audit
✅ No critical vulnerabilities
✅ Follows OWASP Mobile Top 10
✅ Passes penetration testing
```

### 7.3. Performance Acceptance

**AC-6: Performance Metrics**
```
✅ Key derivation: < 1 second
✅ Wallet open: < 2 seconds
✅ Backup export: < 10 seconds
✅ Restore: < 60 seconds (typical wallet)
✅ Migration: < 5 minutes
```

## 8. Out of Scope

### 8.1. Not Included

**OS-1: Multi-Wallet Support**
```
❌ Multiple wallets from same mnemonic (future feature)
❌ Wallet switching (future feature)
❌ Wallet merging (future feature)
```

**OS-2: Advanced Features**
```
❌ Hardware wallet support (future feature)
❌ Multi-signature wallets (future feature)
❌ Shamir Secret Sharing (future feature)
```

**OS-3: Cloud Backup**
```
❌ Automatic cloud backup (future feature)
❌ Cloud sync (future feature)
❌ Encrypted cloud storage (future feature)
```

## 9. Success Metrics

### 9.1. Technical Metrics

```
- Compliance score: 90%+ (from 50%)
- Restore success rate: 99%+
- Migration success rate: 95%+
- Key derivation time: < 1s
- Zero critical security issues
```

### 9.2. User Metrics

```
- User satisfaction: 4.5/5+
- Support tickets: -80% (restore issues)
- Migration completion: 90%+ within 3 months
- App store rating: 4.5/5+
```

### 9.3. Business Metrics

```
- Reputation: "True SSI wallet"
- Standards compliance: 100%
- Platform independence: Achieved
- Vendor lock-in: Eliminated
```

## 10. Timeline

### 10.1. Development Phases

```
Phase 1: Design & Planning (2 weeks)
- Detailed design document
- Migration strategy
- Testing plan

Phase 2: Core Implementation (4 weeks)
- BIP39 key derivation
- New onboarding flow
- New restore flow

Phase 3: Migration Tool (2 weeks)
- Migration detection
- Migration process
- Rollback mechanism

Phase 4: Testing (3 weeks)
- Unit tests
- Integration tests
- Platform testing
- Security audit

Phase 5: Beta Release (2 weeks)
- Beta testing
- Bug fixes
- Performance optimization

Phase 6: Migration Period (12 weeks)
- Announcement
- User support
- Monitoring
- Deadline enforcement

Total: ~25 weeks (6 months)
```

## 11. Risks & Mitigation

### 11.1. Technical Risks

**Risk 1: Migration Failures**
```
Risk: Users lose access during migration
Mitigation:
- Mandatory backup before migration
- Rollback mechanism
- Extended support during migration
- Grace period for issues
```

**Risk 2: Performance Issues**
```
Risk: Key derivation too slow on old devices
Mitigation:
- Optimize derivation algorithm
- Cache derived keys
- Test on low-end devices
- Provide progress indicators
```

### 11.2. User Risks

**Risk 3: User Confusion**
```
Risk: Users don't understand migration
Mitigation:
- Clear documentation
- In-app tutorials
- Video guides
- Support chat
```

**Risk 4: User Resistance**
```
Risk: Users refuse to migrate
Mitigation:
- Explain benefits clearly
- Provide incentives
- Set clear deadline
- Offer migration assistance
```

## 12. Dependencies

### 12.1. External Dependencies

```
- bip39 library (npm)
- @credo-ts/core (npm)
- react-native-keychain (npm)
- Aries Askar (native)
```

### 12.2. Internal Dependencies

```
- Core package (keychain service)
- Auth context (PIN management)
- Agent setup (wallet initialization)
```

## 13. References

### 13.1. Standards

- [BIP39: Mnemonic code for generating deterministic keys](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki)
- [Aries RFC 0050: Wallets](https://github.com/hyperledger/aries-rfcs/tree/main/concepts/0050-wallets)
- [W3C DID Core Specification](https://www.w3.org/TR/did-core/)
- [Self-Sovereign Identity Principles](http://www.lifewithalacrity.com/2016/04/the-path-to-self-soverereign-identity.html)

### 13.2. Related Documents

- `SSI_COMPLIANCE_ANALYSIS.md` - Current compliance analysis
- `RESTORE_PROCESS_ANALYSIS.md` - Current restore process
- `ROOT_CAUSE_ANALYSIS.md` - Root cause of current issues
- `WALLET_SECRET_REUSE_SOLUTION.md` - Current implementation

---

**Document Status:** ✅ Complete  
**Priority:** 🔴 CRITICAL  
**Estimated Effort:** 6 months  
**Breaking Change:** YES  
**Last Updated:** 2026-01-29
