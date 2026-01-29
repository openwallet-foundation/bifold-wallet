# Root Cause Analysis: "Incorrect key for wallet" Error

## Executive Summary

Saya telah menganalisis secara mendalam masalah "Incorrect key for wallet 'walletId'" yang terjadi setelah aplikasi ditutup dan dibuka kembali. **Saya menemukan root cause-nya!**

## Masalah Utama

### Apa yang Terjadi?
1. ✅ Restore wallet berhasil
2. ✅ Wallet bisa digunakan
3. ❌ Setelah aplikasi ditutup dan dibuka lagi → ERROR: "Incorrect key for wallet 'walletId'"

### Root Cause: WALLET KEY MISMATCH

Ada **ketidakcocokan fundamental** antara key yang digunakan saat restore dan key yang digunakan saat app restart.

## Analisis Teknis

### Flow Saat Ini (SALAH)

#### 1. Saat Restore (RestoreWalletScreen.tsx)
```typescript
const targetConfig: WalletConfig = {
  id: 'walletId',      // ✅ Benar
  key: mnemonic,       // ❌ SALAH! Menggunakan mnemonic mentah sebagai key
}
```

#### 2. Saat App Restart (useBifoldAgentSetup.ts)
```typescript
const walletSecret = await loadWalletSecret()  // Load dari keychain
await agent.wallet.open({
  id: walletSecret.id,      // ✅ 'walletId' (sama)
  key: walletSecret.key,    // ❌ KEY BERBEDA! (hashed PIN, bukan mnemonic)
})
```

### Kenapa Ini Terjadi?

#### Saat Onboarding Normal:
1. User set PIN (misal: "123456")
2. System generate wallet secret: `secretForPIN(PIN, hashPIN)`
3. Hasil: `{ id: 'walletId', key: hashedPIN, salt: randomSalt }`
4. Disimpan di keychain
5. Wallet dibuat dengan `key: hashedPIN`

#### Saat Restore (Implementasi Sekarang):
1. User input mnemonic
2. Wallet di-import dengan `key: mnemonic` ← **INI MASALAHNYA!**
3. Tidak ada PIN yang di-set
4. Tidak ada wallet secret yang disimpan di keychain

#### Saat App Restart:
1. System load wallet secret dari keychain
2. Dapat `key: hashedPIN` (dari onboarding lama)
3. Coba buka wallet dengan `key: hashedPIN`
4. **ERROR!** Karena wallet di-restore dengan `key: mnemonic`, bukan `key: hashedPIN`

## Solusi

### Yang Harus Dilakukan:

Wallet yang di-restore **HARUS** menggunakan key yang sama dengan yang akan digunakan saat app restart, yaitu **hashed PIN**, bukan mnemonic mentah.

### Flow yang Benar:

#### 1. Update RestoreWalletScreen
Tambahkan input PIN:
```typescript
// User input:
const [mnemonic, setMnemonic] = useState('')  // Untuk decrypt backup
const [pin, setPin] = useState('')            // Untuk wallet key

const handleRestore = async () => {
  // Generate wallet secret dari PIN (sama seperti onboarding)
  const secret = await secretForPIN(pin, hashPIN)
  // secret = { id: 'walletId', key: hashedPIN, salt: randomSalt }
  
  const targetConfig: WalletConfig = {
    id: secret.id,      // 'walletId'
    key: secret.key,    // Hashed PIN (BUKAN mnemonic!)
  }
  
  // Import wallet dengan hashed PIN sebagai key
  await backupService.restoreWalletComplete(
    agent,
    filePath,
    mnemonic,      // Hanya untuk decrypt backup
    targetConfig,  // Wallet config dengan hashed PIN
    mediatorUrl,
    onProgress
  )
  
  // PENTING: Simpan wallet secret ke keychain
  await storeWalletSecret(secret, useBiometrics)
}
```

#### 2. Saat App Restart
```typescript
const walletSecret = await loadWalletSecret()  // Load dari keychain
// Dapat: { id: 'walletId', key: hashedPIN, salt: randomSalt }

await agent.wallet.open({
  id: walletSecret.id,      // 'walletId'
  key: walletSecret.key,    // hashedPIN (SAMA dengan saat restore!)
})
// ✅ BERHASIL! Key-nya cocok!
```

## Perbedaan Mnemonic vs Wallet Key

### Mnemonic
- **Fungsi**: Untuk backup dan restore
- **Digunakan**: Saat export/import wallet
- **Tidak disimpan**: Di keychain
- **Bisa berubah**: Tidak (tetap sama)

### Wallet Key (Hashed PIN)
- **Fungsi**: Untuk membuka wallet sehari-hari
- **Digunakan**: Setiap kali buka wallet
- **Disimpan**: Di keychain (secure storage)
- **Bisa berubah**: Ya (kalau user ganti PIN)

### Analogi
- **Mnemonic** = Kunci cadangan di brankas bank (untuk emergency)
- **Wallet Key** = Kunci rumah sehari-hari (untuk akses normal)

## Implementasi yang Diperlukan

### File yang Harus Diubah:

#### 1. `packages/backup/src/screens/RestoreWalletScreen.tsx`
```typescript
// Tambahkan:
import { secretForPIN, storeWalletSecret } from '@aries-bifold/core/src/services/keychain'
import { useServices, TOKENS } from '@aries-bifold/core/src/container-api'

// Dalam component:
const [pin, setPin] = useState('')
const [hashPIN] = useServices([TOKENS.FN_PIN_HASH_ALGORITHM])

// Dalam handleRestore:
const secret = await secretForPIN(pin, hashPIN)
const targetConfig = { id: secret.id, key: secret.key }
// ... restore ...
await storeWalletSecret(secret, useBiometrics)
```

#### 2. `packages/core/src/navigators/SettingStack.tsx`
```typescript
// Tambahkan mediatorUrl prop:
<Stack.Screen 
  name="RestoreWallet" 
  component={RestoreWalletScreen}
  initialParams={{ 
    mediatorUrl: store.preferences.selectedMediator 
  }}
/>
```

## Testing Plan

### Unit Tests
- [ ] Test `secretForPIN()` dengan berbagai PIN
- [ ] Test `storeWalletSecret()` ke keychain
- [ ] Test restore dengan PIN-based key

### Integration Tests
1. Restore wallet dengan mnemonic + PIN baru
2. Tutup aplikasi sepenuhnya
3. Buka aplikasi lagi
4. Input PIN
5. ✅ Wallet harus terbuka tanpa error
6. ✅ Semua credentials harus ada

### Edge Cases
- [ ] Restore dengan biometrics enabled
- [ ] Restore dengan biometrics disabled
- [ ] Ganti PIN setelah restore
- [ ] Multiple restore attempts

## Impact & Considerations

### Breaking Change
⚠️ Users yang sudah restore dengan flow lama harus restore ulang dengan flow baru

### Security
✅ Lebih aman karena mnemonic dan wallet key terpisah
✅ Konsisten dengan onboarding flow
✅ Support biometric authentication

### User Experience
- User harus set PIN saat restore (tambahan 1 step)
- Tapi ini necessary untuk security dan consistency

## Next Steps

### Priority 1 (CRITICAL)
1. Implement PIN input di RestoreWalletScreen
2. Generate wallet secret dari PIN
3. Store wallet secret ke keychain
4. Test complete flow

### Priority 2
1. Fix mediatorUrl undefined issue
2. Manual testing di Android
3. Manual testing di iOS

### Priority 3
1. Integration tests
2. Documentation update
3. Migration guide untuk existing users

## References

### Dokumentasi Lengkap
- `WALLET_SECRET_CONSISTENCY_FIX.md` - Detailed implementation plan
- `IMPLEMENTATION_SUMMARY.md` - Updated dengan root cause analysis

### Key Files
- `packages/core/src/services/keychain.ts` - Wallet secret management
- `packages/core/src/contexts/auth.tsx` - PIN authentication
- `packages/core/src/hooks/useBifoldAgentSetup.ts` - Agent initialization
- `packages/backup/src/screens/RestoreWalletScreen.tsx` - Restore UI (needs fix)
- `packages/backup/src/services/BackupService.ts` - Restore logic

### Key Functions
- `secretForPIN()` - Generate wallet secret dari PIN
- `storeWalletSecret()` - Simpan ke keychain
- `loadWalletSecret()` - Load dari keychain
- `agent.wallet.import()` - Import wallet dari backup
- `agent.wallet.open()` - Buka wallet

## Kesimpulan

**Root cause sudah ditemukan**: Wallet di-restore dengan `key: mnemonic` tapi app restart coba buka dengan `key: hashedPIN`.

**Solusi**: Restore harus menggunakan PIN-based key (sama seperti onboarding), bukan mnemonic mentah.

**Status**: Ready untuk implementasi. Semua analisis sudah lengkap, tinggal implement perubahan di RestoreWalletScreen.
