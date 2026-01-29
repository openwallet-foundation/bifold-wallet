# Analisis Waktu Restore - Proses Lengkap Sistem Backup & Restore

## Executive Summary

Dokumen ini menganalisis **proses restore wallet** secara detail dari perspektif waktu eksekusi, flow data, dan interaksi antar komponen. Analisis ini penting untuk memahami bottleneck performa dan memastikan user experience yang optimal.

---

## 1. Overview Proses Restore

### 1.1. Definisi
**Restore** adalah proses menghidupkan kembali wallet dari file backup yang terenkripsi menjadi wallet aktif yang siap digunakan di perangkat baru atau setelah reinstall aplikasi.

### 1.2. Input & Output

**Input:**
- File backup (`.zip` atau `.db`) yang terenkripsi
- Mnemonic (12 kata BIP39) untuk dekripsi
- Wallet Secret dari keychain (berisi hashed PIN)
- Mediator URL untuk koneksi

**Output:**
- Wallet aktif dengan semua credentials
- Koneksi ke mediator
- Wallet secret tersimpan di keychain
- Agent siap digunakan

---

## 2. Timeline Proses Restore (Step-by-Step)

### 2.1. Phase 1: User Input & Validation (0-2 detik)

#### Step 1.1: User Memilih File Backup
```
Waktu: ~500ms - 1s
Komponen: DocumentPicker (React Native)
```

**Proses:**
1. User tap tombol "Select Backup File"
2. OS membuka file picker native
3. User navigasi dan pilih file `.zip`
4. File di-copy ke cache directory aplikasi

**Lokasi File:**
- Android: `/data/user/0/com.ariesbifold/cache/`
- iOS: `{CachesDirectory}/`

**Kode:**
```typescript
// packages/backup/src/services/BackupService.ts
public async pickBackupFile(): Promise<string | null> {
  const result = await DocumentPicker.pickSingle({
    type: [DocumentPicker.types.allFiles, 'application/zip'],
    copyTo: 'cachesDirectory',  // ← File di-copy ke sini
  })
  return result.fileCopyUri || null
}
```

#### Step 1.2: User Input Mnemonic
```
Waktu: ~5-10 detik (tergantung user)
Komponen: TextInput (React Native)
```

**Proses:**
1. User ketik/paste 12 kata mnemonic
2. UI validasi format (12 kata, lowercase, spasi)
3. Tidak ada validasi kriptografis di tahap ini (untuk performa)

#### Step 1.3: Load Wallet Secret dari Keychain
```
Waktu: ~100-200ms
Komponen: Keychain (React Native Keychain)
```

**Proses:**
```typescript
// packages/backup/src/screens/RestoreWalletScreen.tsx
const walletSecret = await loadWalletSecret()
// Dapat: { id: 'walletId', key: hashedPIN, salt: randomSalt }
```

**Penting:** Wallet secret ini berisi **hashed PIN** yang akan digunakan sebagai wallet key, BUKAN mnemonic!

---

### 2.2. Phase 2: Validation (2-5 detik)

#### Step 2.1: Validate Backup File
```
Waktu: ~1-3 detik (tergantung ukuran file)
Status: RestoreStatus.VALIDATING
```

**Proses:**
```typescript
// packages/backup/src/services/BackupService.ts
private async validateBackupFile(filePath: string): Promise<void> {
  // 1. Check file exists
  if (!(await RNFS.exists(filePath))) {
    throw new Error('Backup file not found')
  }

  // 2. Check file size > 0
  const stat = await RNFS.stat(filePath)
  if (stat.size === 0) {
    throw new Error('Backup file is empty')
  }

  // 3. If zip, test unzip and check for .db file
  if (filePath.toLowerCase().endsWith('.zip')) {
    const testUnzipDir = `${RNFS.CachesDirectoryPath}/test_unzip_${Date.now()}`
    
    await RNFS.mkdir(testUnzipDir)
    await unzip(filePath, testUnzipDir)  // ← Ini yang paling lama!

    const files = await RNFS.readDir(testUnzipDir)
    const hasDb = files.some(f => f.name.endsWith('.db'))

    if (!hasDb) {
      throw new Error('No database file found in backup')
    }

    // Cleanup
    await RNFS.unlink(testUnzipDir)
  }
}
```

**Breakdown Waktu:**
- File exists check: ~10ms
- File size check: ~10ms
- Unzip test: ~1-2 detik (tergantung ukuran backup)
- File scan: ~100ms
- Cleanup: ~200ms

**Total: ~1.5-3 detik**

---

### 2.3. Phase 3: Shutdown & Cleanup (5-8 detik)

#### Step 3.1: Close Current Wallet
```
Waktu: ~500ms - 1s
Status: RestoreStatus.SHUTTING_DOWN
```

**Proses:**
```typescript
// packages/backup/src/services/BackupService.ts
if (agent.wallet.isInitialized) {
  await agent.wallet.close()
}
```

**Yang Terjadi:**
1. Flush pending transactions ke database
2. Close database connections
3. Release memory locks
4. Cleanup event listeners

#### Step 3.2: Delete Old Wallet
```
Waktu: ~2-5 detik (tergantung ukuran wallet)
Status: RestoreStatus.DELETING_OLD
```

**Proses:**
```typescript
// packages/backup/src/services/BackupService.ts
public async deleteWallet(walletId: string): Promise<void> {
  const walletDir = `${RNFS.DocumentDirectoryPath}/.afj/wallet/${walletId}`
  
  if (await RNFS.exists(walletDir)) {
    await RNFS.unlink(walletDir)  // ← Recursive delete
  }
}
```

**Lokasi Wallet:**
- Android: `/data/user/0/com.ariesbifold/files/.afj/wallet/walletId/`
- iOS: `{DocumentDirectory}/.afj/wallet/walletId/`

**Isi Folder:**
- `sqlite.db` - Database utama (5-50 MB)
- `sqlite.db-wal` - Write-Ahead Log
- `sqlite.db-shm` - Shared Memory
- Metadata files

**Breakdown Waktu:**
- Check exists: ~10ms
- Delete files: ~2-5 detik (tergantung ukuran)

---

### 2.4. Phase 4: Import Wallet (8-20 detik) ⚠️ CRITICAL PATH

#### Step 4.1: Unzip Backup (jika .zip)
```
Waktu: ~2-5 detik
Status: RestoreStatus.IMPORTING
```

**Proses:**
```typescript
// packages/backup/src/services/BackupService.ts
if (importPath.toLowerCase().endsWith('.zip')) {
  await RNFS.mkdir(unzipDir)
  await unzip(importPath, unzipDir)  // ← Ekstrak file
  
  const files = await RNFS.readDir(unzipDir)
  const dbFile = files.find(f => f.name.endsWith('.db'))
  importPath = dbFile.path
}
```

#### Step 4.2: Import Database dengan Askar
```
Waktu: ~5-15 detik ⚠️ PALING LAMA!
Status: RestoreStatus.IMPORTING
```

**Proses:**
```typescript
// packages/backup/src/services/BackupService.ts
await agent.wallet.import(walletConfig, {
  path: importPath,
  key: mnemonic,  // ← Untuk DEKRIPSI backup
})
```

**Yang Terjadi di Level Askar (Rust):**

1. **Read Encrypted Backup** (~500ms)
   - Baca file backup dari disk
   - Parse header dan metadata

2. **Key Derivation** (~2-3 detik)
   ```
   Mnemonic → Argon2 KDF → Decryption Key
   ```
   - Argon2 adalah KDF yang **sengaja lambat** untuk security
   - Membutuhkan banyak memory dan CPU
   - Ini adalah **bottleneck utama**!

3. **Decrypt Records** (~2-5 detik)
   - Dekripsi setiap record di backup
   - Menggunakan ChaCha20-Poly1305
   - Verify MAC untuk setiap record

4. **Re-encrypt dengan Wallet Key** (~2-5 detik)
   ```
   Decrypted Data → Encrypt dengan hashedPIN → New Database
   ```
   - Data yang sudah didekripsi langsung dienkripsi ulang
   - Menggunakan `walletConfig.key` (hashed PIN dari keychain)
   - Ini memastikan wallet bisa dibuka dengan PIN yang sama

5. **Write to New Database** (~1-2 detik)
   - Tulis semua records ke database baru
   - Create indexes
   - Flush to disk

**Total: ~8-17 detik**

**Diagram Flow:**
```
Backup File (Encrypted with Mnemonic)
    ↓
[Argon2 KDF] ← 2-3 detik
    ↓
Decryption Key
    ↓
[ChaCha20-Poly1305 Decrypt] ← 2-5 detik
    ↓
Plaintext Records (in memory)
    ↓
[ChaCha20-Poly1305 Encrypt with hashedPIN] ← 2-5 detik
    ↓
New Database (Encrypted with hashedPIN)
    ↓
[Write to Disk] ← 1-2 detik
    ↓
Done!
```

---

### 2.5. Phase 5: Initialize Agent (20-25 detik)

#### Step 5.1: Open Wallet
```
Waktu: ~1-2 detik
Status: RestoreStatus.INITIALIZING
```

**Proses:**
```typescript
// packages/backup/src/services/BackupService.ts
await agent.wallet.open({
  id: walletId,
  key: walletKey,  // ← Hashed PIN dari keychain
})
```

**Yang Terjadi:**
1. Open SQLite database
2. Verify wallet key (hashed PIN)
3. Load wallet metadata
4. Initialize crypto context

#### Step 5.2: Initialize Agent
```
Waktu: ~2-3 detik
Status: RestoreStatus.INITIALIZING
```

**Proses:**
```typescript
if (!agent.isInitialized) {
  await agent.initialize()
}
```

**Yang Terjadi:**
1. Load all modules (DIDComm, Credentials, Proofs, etc.)
2. Setup event listeners
3. Initialize transport layer
4. Load cached data

---

### 2.6. Phase 6: Connect Mediator (25-30 detik)

#### Step 6.1: Setup Mediator Connection
```
Waktu: ~3-5 detik
Status: RestoreStatus.CONNECTING_MEDIATOR
```

**Proses:**
```typescript
// packages/backup/src/services/BackupService.ts
await setMediationToDefault(agent, mediatorUrl)
```

**Yang Terjadi:**
1. **Discover Mediator** (~500ms)
   - HTTP request ke mediator URL
   - Get mediator DID and endpoint

2. **Create Connection** (~1-2 detik)
   - Generate invitation
   - Exchange DIDComm messages
   - Establish secure channel

3. **Request Mediation** (~1-2 detik)
   - Send mediation request
   - Wait for grant
   - Update routing keys

4. **Sync Messages** (~500ms - 1s)
   - Fetch pending messages from mediator
   - Process message queue

**Total: ~3-5 detik**

---

### 2.7. Phase 7: Success (30 detik)

```
Status: RestoreStatus.SUCCESS
```

**Proses:**
- Update UI state
- Navigate to home screen
- Show success message

---

## 3. Total Timeline Summary

| Phase | Duration | Status | Critical? |
|-------|----------|--------|-----------|
| 1. User Input & Validation | 0-2s | - | No |
| 2. Validation | 2-5s | VALIDATING | No |
| 3. Shutdown & Cleanup | 5-8s | SHUTTING_DOWN, DELETING_OLD | No |
| 4. Import Wallet | 8-20s | IMPORTING | ⚠️ **YES** |
| 5. Initialize Agent | 20-25s | INITIALIZING | No |
| 6. Connect Mediator | 25-30s | CONNECTING_MEDIATOR | No |
| 7. Success | 30s | SUCCESS | No |

**Total: ~30 detik** (untuk backup berukuran sedang ~10-20 MB)

---

## 4. Bottleneck Analysis

### 4.1. Critical Path: Import Wallet (Phase 4)

**Mengapa Paling Lama?**

1. **Argon2 KDF** (~2-3 detik)
   - Sengaja lambat untuk security
   - Tidak bisa di-optimize tanpa mengorbankan security
   - **Solusi:** Tidak ada (by design)

2. **Decrypt + Re-encrypt** (~4-10 detik)
   - Harus memproses setiap record
   - Tidak bisa di-parallelize (sequential)
   - **Solusi:** Optimize di level Askar (Rust)

3. **Disk I/O** (~1-2 detik)
   - Tergantung kecepatan storage device
   - **Solusi:** Gunakan SSD (sudah default di modern phones)

### 4.2. Faktor yang Mempengaruhi Waktu

| Faktor | Impact | Mitigasi |
|--------|--------|----------|
| **Ukuran Backup** | High | Compress backup, cleanup old data |
| **CPU Speed** | Medium | Tidak bisa dikontrol |
| **Storage Speed** | Medium | Tidak bisa dikontrol |
| **Network Speed** | Low | Hanya untuk mediator (optional) |
| **Argon2 Parameters** | High | Sudah optimal (by design) |

---

## 5. User Experience Considerations

### 5.1. Progress Indicators

**Penting:** User harus tahu apa yang sedang terjadi!

```typescript
export enum RestoreStatus {
  VALIDATING = 'validating',           // "Checking backup file..."
  SHUTTING_DOWN = 'shutting_down',     // "Preparing..."
  DELETING_OLD = 'deleting_old',       // "Cleaning up..."
  IMPORTING = 'importing',             // "Importing wallet..." ⚠️ LAMA!
  INITIALIZING = 'initializing',       // "Setting up..."
  CONNECTING_MEDIATOR = 'connecting_mediator', // "Connecting..."
  SUCCESS = 'success',                 // "Done!"
}
```

**Rekomendasi UI:**
- Show progress bar dengan estimasi waktu
- Show current status message
- Show "This may take up to 30 seconds" warning
- Disable back button during import (prevent corruption)

### 5.2. Error Handling

**Common Errors:**

1. **"Incorrect mnemonic"**
   - Terjadi di Phase 4 (Import)
   - Argon2 KDF gagal verify
   - **Recovery:** User input mnemonic lagi

2. **"Backup file corrupted"**
   - Terjadi di Phase 2 (Validation)
   - File tidak bisa di-unzip atau tidak ada .db
   - **Recovery:** User pilih file lain

3. **"Insufficient storage"**
   - Terjadi di Phase 4 (Import)
   - Tidak cukup space untuk database baru
   - **Recovery:** User hapus data lain

4. **"Mediator connection failed"**
   - Terjadi di Phase 6 (Connect Mediator)
   - Network error atau mediator down
   - **Recovery:** Continue without mediator (user can reconnect later)

---

## 6. Performance Optimization Opportunities

### 6.1. Short-term (Easy Wins)

1. **Parallel Validation**
   ```typescript
   // Saat ini: Sequential
   await validateBackupFile(filePath)
   await loadWalletSecret()
   
   // Bisa: Parallel
   const [_, walletSecret] = await Promise.all([
     validateBackupFile(filePath),
     loadWalletSecret()
   ])
   ```
   **Gain:** ~200ms

2. **Skip Test Unzip**
   - Saat ini kita unzip 2x (test + actual)
   - Bisa skip test unzip jika user sudah confirm
   **Gain:** ~1-2 detik

3. **Lazy Mediator Connection**
   - Connect mediator di background setelah restore
   - User bisa langsung pakai wallet
   **Gain:** ~3-5 detik (perceived)

### 6.2. Long-term (Requires Askar Changes)

1. **Streaming Import**
   - Import records secara streaming (tidak load semua ke memory)
   - **Gain:** ~2-3 detik + less memory

2. **Parallel Decryption**
   - Decrypt multiple records in parallel (multi-thread)
   - **Gain:** ~2-5 detik

3. **Incremental Import**
   - Import only changed records (delta sync)
   - **Gain:** ~5-10 detik (untuk re-restore)

---

## 7. Testing Scenarios

### 7.1. Performance Test Cases

| Test Case | Expected Time | Pass Criteria |
|-----------|---------------|---------------|
| Small backup (5 MB) | ~15-20s | < 25s |
| Medium backup (20 MB) | ~25-30s | < 40s |
| Large backup (50 MB) | ~40-60s | < 90s |
| Slow device (old phone) | +50% | < 60s for medium |
| Fast device (flagship) | -30% | < 20s for medium |

### 7.2. Stress Test Cases

1. **Concurrent Restore**
   - Multiple users restore at same time
   - Check for race conditions

2. **Low Storage**
   - Restore with only 100 MB free space
   - Should fail gracefully

3. **Network Interruption**
   - Disconnect network during mediator connection
   - Should continue without mediator

4. **App Kill**
   - Kill app during import
   - Should cleanup temp files on restart

---

## 8. Monitoring & Metrics

### 8.1. Key Metrics to Track

```typescript
interface RestoreMetrics {
  totalDuration: number          // Total waktu restore
  validationDuration: number     // Phase 2
  importDuration: number         // Phase 4 (critical!)
  initializeDuration: number     // Phase 5
  mediatorDuration: number       // Phase 6
  backupSize: number             // Ukuran file backup
  recordCount: number            // Jumlah records di backup
  deviceModel: string            // Model HP
  osVersion: string              // Versi OS
  success: boolean               // Berhasil atau tidak
  errorMessage?: string          // Error message jika gagal
}
```

### 8.2. Analytics Events

```typescript
// Start restore
analytics.track('restore_started', {
  backupSize: fileSize,
  timestamp: Date.now()
})

// Progress updates
analytics.track('restore_progress', {
  status: RestoreStatus.IMPORTING,
  duration: elapsedTime
})

// Complete
analytics.track('restore_completed', {
  totalDuration: totalTime,
  success: true
})

// Error
analytics.track('restore_failed', {
  error: errorMessage,
  phase: currentPhase,
  duration: elapsedTime
})
```

---

## 9. Kesimpulan

### 9.1. Key Takeaways

1. **Total waktu restore: ~30 detik** untuk backup berukuran sedang
2. **Critical path: Import Wallet (Phase 4)** - menghabiskan ~40% total waktu
3. **Argon2 KDF adalah bottleneck utama** - by design untuk security
4. **User experience sangat penting** - harus ada progress indicator yang jelas
5. **Error handling harus robust** - banyak potential failure points

### 9.2. Rekomendasi

**Untuk Developer:**
- Implement progress indicator yang detail
- Add timeout handling (max 2 menit)
- Log metrics untuk monitoring
- Test di berbagai device (low-end to high-end)

**Untuk User:**
- Pastikan koneksi stabil
- Jangan close app selama restore
- Siapkan waktu ~1 menit
- Pastikan storage cukup (minimal 2x ukuran backup)

---

**Document Status:** ✅ Complete  
**Last Updated:** 2026-01-29  
**Author:** Technical Analysis Team
