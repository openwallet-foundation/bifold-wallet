# Backup Restore Fix - Implementation Tasks

## Task Overview

This task list breaks down the implementation into manageable chunks with clear dependencies.

## Tasks

### Phase 1: Core Functionality

- [x] 1. Add Types and Enums
  - [x] 1.1 Create `RestoreStatus` enum in `BackupService.ts`
  - [x] 1.2 Create `RestoreProgress` interface
  - [x] 1.3 Export types from `index.ts`

- [x] 2. Implement `deleteWallet()` Method
  - [x] 2.1 Add method signature to `BackupService` class
  - [x] 2.2 Implement wallet path construction (Android/iOS compatible)
  - [x] 2.3 Add existence check with `RNFS.exists()`
  - [x] 2.4 Implement directory deletion with `RNFS.unlink()`
  - [x] 2.5 Add logging for success/skip cases
  - [x] 2.6 Add error handling with descriptive messages

- [x] 3. Implement `validateBackupFile()` Method
  - [x] 3.1 Add private method to `BackupService` class
  - [x] 3.2 Check file exists
  - [x] 3.3 Check file size > 0
  - [x] 3.4 For zip files: test unzip and check for .db file
  - [x] 3.5 Add proper error messages for each validation failure
  - [x] 3.6 Cleanup temporary files after validation

- [x] 4. Implement `restoreWalletComplete()` Method
  - [x] 4.1 Add method signature with all parameters
  - [x] 4.2 Implement Step 1: Validate backup file
  - [x] 4.3 Implement Step 2: Shutdown agent
  - [x] 4.4 Implement Step 3: Delete old wallet
  - [x] 4.5 Implement Step 4: Import wallet
  - [x] 4.6 Implement Step 5: Reinitialize agent
  - [x] 4.7 Implement Step 6: Setup mediator (with try-catch)
  - [x] 4.8 Add progress callbacks for each step
  - [x] 4.9 Add comprehensive error handling
  - [x] 4.10 Add cleanup in finally block

### Phase 2: UI Updates

- [x] 5. Update RestoreWalletScreen
  - [x] 5.1 Import `RestoreStatus` enum and types
  - [x] 5.2 Add `restoreStatus` state variable
  - [x] 5.3 Get mediator URL from store preferences
  - [x] 5.4 Update `handleRestore()` to use `restoreWalletComplete()`
  - [x] 5.5 Add progress callback to update status
  - [x] 5.6 Implement `getStatusMessage()` helper
  - [x] 5.7 Implement `getErrorMessage()` helper
  - [x] 5.8 Add progress display UI component
  - [x] 5.9 Update loading indicator to show current status
  - [x] 5.10 Test UI on both Android and iOS

### Phase 3: Testing

- [x] 6. Unit Tests for BackupService
  - [x] 6.1 Setup test file: `BackupService.test.ts`
  - [x] 6.2 Mock RNFS functions
  - [x] 6.3 Test `deleteWallet()` - success case
  - [x] 6.4 Test `deleteWallet()` - wallet not exists
  - [x] 6.5 Test `deleteWallet()` - permission error
  - [x] 6.6 Test `validateBackupFile()` - valid zip
  - [x] 6.7 Test `validateBackupFile()` - corrupted file
  - [x] 6.8 Test `validateBackupFile()` - empty file
  - [x] 6.9 Test `validateBackupFile()` - no database in zip
  - [x] 6.10 Test `restoreWalletComplete()` - happy path
  - [x] 6.11 Test `restoreWalletComplete()` - mediator failure (should not fail)
  - [x] 6.12 Test `restoreWalletComplete()` - import failure (should cleanup)

- [x] 13. Integrate Migration Detection in App Startup
  - [x] 13.1 Update App.tsx navigation context
  - [x] 13.2 Add NavigationRefContext to share navigation ref
  - [x] 13.3 Create useNavigationRef() hook
  - [x] 13.4 Update RootStack to use navigation ref
  - [x] 13.5 Check migration status on app start
  - [x] 13.6 Show migration prompt if needed
  - [x] 13.7 Track postpone count in AsyncStorage
  - [x] 13.8 Enforce deadline (after 90 days)
  - [x] 13.9 Add MigrationFlowScreen to MainStack navigation
  - [x] 13.10 Navigate to MigrationFlowScreen when user accepts

- [ ] 7. Integration Tests
  - [ ] 7.1 Test restore on fresh install (no existing wallet)
  - [ ] 7.2 Test restore over existing wallet
  - [ ] 7.3 Test restore with wrong mnemonic
  - [ ] 7.4 Test restore with corrupted backup
  - [ ] 7.5 Test mediator connection after restore
  - [ ] 7.6 Test receiving credentials after restore
  - [ ] 7.7 Test receiving messages after restore

### Phase 4: Error Handling & Edge Cases

- [ ] 8. Enhance Error Handling
  - [ ] 8.1 Add specific error types/classes
  - [ ] 8.2 Improve error messages for common scenarios
  - [ ] 8.3 Add error recovery suggestions
  - [ ] 8.4 Add logging for debugging
  - [ ] 8.5 Handle concurrent restore attempts
  - [ ] 8.6 Handle app backgrounding during restore

- [ ] 9. Edge Cases
  - [ ] 9.1 Handle very large backup files (>100MB)
  - [ ] 9.2 Handle slow network (mediator connection timeout)
  - [ ] 9.3 Handle low storage space
  - [ ] 9.4 Handle app crash during restore
  - [ ] 9.5 Handle restore while wallet is locked

### Phase 5: Documentation & Polish

- [x] 10. Documentation
  - [x] 10.1 Add JSDoc comments to all new methods
  - [x] 10.2 Update README with restore flow explanation
  - [x] 10.3 Add troubleshooting guide for common errors
  - [x] 10.4 Document mediator reconnection process

- [x] 11. Code Quality
  - [x] 11.1 Run linter and fix issues
  - [x] 11.2 Run type checker and fix issues
  - [x] 11.3 Add missing type annotations
  - [x] 11.4 Remove console.logs (use logger instead)
  - [x] 11.5 Code review and refactoring

- [ ] 12. User Experience
  - [ ] 12.1 Add loading animations
  - [ ] 12.2 Add success animation/feedback
  - [ ] 12.3 Improve error messages wording
  - [ ] 12.4 Add help text/tooltips
  - [ ] 12.5 Test accessibility (screen readers)

### Phase 6: Deployment

- [-] 14. Pre-deployment Checks
  - [x] 14.1 All tests passing (15/15 unit tests pass)
  - [x] 14.2 No TypeScript errors
  - [x] 14.3 No ESLint warnings
  - [x] 14.4 Key consistency fix implemented and tested
  - [ ] 14.5 Manual testing on Android completed (READY FOR TESTING)
  - [ ] 14.6 Manual testing on iOS completed
  - [ ] 14.7 Performance testing (restore time < 30s)
  - [ ] 14.8 Memory leak testing

- [ ] 15. Deployment
  - [ ] 15.1 Create feature branch
  - [ ] 15.2 Commit changes with clear messages
  - [ ] 15.3 Create pull request
  - [ ] 15.4 Code review
  - [ ] 15.5 Address review comments
  - [ ] 15.6 Merge to main branch
  - [ ] 15.7 Deploy to staging
  - [ ] 15.8 QA testing on staging
  - [ ] 15.9 Deploy to production (gradual rollout)
  - [ ] 15.10 Monitor error rates and user feedback

## Task Dependencies

```
1 (Types) → 2, 3, 4 (Core Methods)
2, 3, 4 → 5 (UI Updates)
2, 3, 4 → 6 (Unit Tests)
5 → 7 (Integration Tests)
6, 7 → 8, 9 (Error Handling)
8, 9 → 10, 11, 12 (Polish)
10, 11, 12 → 13, 14, 15 (Deployment & Migration)
```

## Estimated Time

- Phase 1: 4-6 hours
- Phase 2: 2-3 hours
- Phase 3: 4-6 hours
- Phase 4: 3-4 hours
- Phase 5: 2-3 hours
- Phase 6: 2-3 hours

**Total: 17-25 hours** (2-3 days of focused work)

## Priority

### Must Have (P0)
- Tasks 1-4: Core functionality
- Task 5: UI updates
- Task 6.1-6.10: Basic unit tests
- Task 13: Migration detection integration
- Tasks 14-15: Deployment

### Should Have (P1)
- Task 6.11-6.12: Advanced unit tests
- Task 7: Integration tests
- Task 8: Enhanced error handling
- Task 10: Documentation

### Nice to Have (P2)
- Task 9: Edge cases
- Task 11: Code quality improvements
- Task 12: UX enhancements

## Success Criteria

✅ User can restore wallet without "already exists" error
✅ Old wallet is automatically deleted before restore
✅ Mediator connection is automatically setup after restore
✅ User can receive messages/credentials after restore
✅ Clear progress indication during restore
✅ User-friendly error messages
✅ All tests passing
✅ No regressions in existing functionality
✅ Migration detection works on app startup
✅ Migration prompt appears for old-format wallets
✅ Postpone tracking works correctly (max 3 times)
✅ Deadline enforcement after 90 days
✅ Navigation to migration flow works seamlessly

## Rollback Plan

If critical issues found after deployment:
1. Revert to previous version immediately
2. Disable restore feature via feature flag
3. Investigate and fix issues
4. Redeploy with fixes

## Notes

- Test on both Android and iOS devices
- Test with different backup file sizes
- Test with slow network conditions
- Consider adding feature flag for gradual rollout
- Monitor Sentry/Crashlytics for errors after deployment
