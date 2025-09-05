# @bifold/core

## 2.7.0

### Minor Changes

- 7cd5ad2: fixed logging interface to accept data and error

## 2.6.0

### Minor Changes

- e6c4d63: fixed imports, fixed release builds, added export

## 2.5.0

### Minor Changes

- 66bbd8d: removed src files from bifold release

## 2.4.6

### Patch Changes

- 9214b8c: added network info to json details screen

## 2.4.5

### Patch Changes

- 502d616: Refactored ledgers API to be configurable

## 2.4.4

### Patch Changes

- d0a74bc: added error boundary to app

## 2.4.3

### Patch Changes

- 69eff6c: fix credential card watermark and slice when in revoked state

## 2.4.2

### Patch Changes

- 1d56182: Prevent accidentally overwritten persisted state on load

## 2.4.1

### Patch Changes

- dbf5cee: Allow explicit undefined values for ThemeBuilder
- a60aefd: pincreate screen views no longer keyboard avoiding

## 2.4.0

### Minor Changes

- 2ac4abc: Added types for all missing theme properties.
  Removed redundant types from theme.
  Created a ThemeBuilder class to override existing theme styles.
  Patched a couple places which were using incorrect styles.
- 28dbede: Swapped references to ColorPallet -> ColorPalette

### Patch Changes

- 0d86620: Adds divider between notification banners

## 2.3.0

### Minor Changes

- da487bb: Bump all dependency patch versions including React Native, some minor version bumps

### Patch Changes

- 84e7336: Updated revoked credential styling
- 85f21e2: react native gifted chat no longer uses redundant keyboard avoiding view padding on ios

## 2.2.1

### Patch Changes

- b25d47a: App no longer resizes when software keyboard is open on Android
  KeyboardView now takes optional prop to be keyboardavoiding
  Keyboard avoidance added to pinenter, changebiometry, pinverify, pinchange, and chat.
- 4dd8198: updated no interest toast to use banner instead
- d7f53f9: Remove extra safearea from developer modal
- 0716823: PIN automatically triggers unlock when minPINLength characters are entered
- 242c7f8: Swapped credential_help_url for issuer_url in failed proof request

## 2.2.0

### Minor Changes

- 3eb208e: Update OID proof request select card UI

### Patch Changes

- 2983113: feat: custom mediator added to developer mode
- 5a0db59: use correct button styles from theme

## 2.1.10

### Patch Changes

- 7ce710c: added json details button to proof request screen

## 2.1.9

### Patch Changes

- 3cca189: added ability to view json details from credential and contact details screen in dev mode, added issued date to credential details screen in dev mode

## 2.1.8

### Patch Changes

- c4a8205: fixed issue with limited text input

## 2.1.7

### Patch Changes

- a6d2698: added Forgot your PIN link to PINEnter screen that displays a popup explaining that the PIN cannot be reset. added build number to bottom of PINEnter screen.
- 877a83c: fix PINInput accessibility issues

## 2.1.6

### Patch Changes

- 4d2e589: swapped logo in qr loading splash
- ab196c9: changed accessibility labels in the actions slider in the chat screen

## 2.1.5

### Patch Changes

- c1fc9b1: updated accessibility labels

## 2.1.4

### Patch Changes

- 7a82c42: fixed issue with ios touch id not working
- c75e2cd: fix issue with message pickup after lockout

## 2.1.3

### Patch Changes

- 45a5b6a: patch @credo-ts/indy-vdr to prevent issues with revocation check
- 271cea1: pin accessability improvements
- 11670da: fix an issue with lockout and pickup changes to directory casing
- f45f3f8: Added logout button when developer mode is active

## 2.1.2

### Patch Changes

- cb5c501: Vibrate on dev mode enabled from onboarding

## 2.1.1

### Patch Changes

- a939fdf: Fix onboarding crash when developer sfeature enabled by refactoring wallet naming screens

## 2.1.0

### Minor Changes

- 450c153: feat: Add the ability to select alternative credentil when presenting OpenID proof request
- 211f88a: Refactor PIN Enter screen into two separate screens for verifying PIN in unlocked wallet and for unlocking wallet

### Patch Changes

- f50bea0: fix: UI updates for OpenID cards flow
- 7384419: UI fixes, optionally block screenshots on pin screens, developer modal from onboarding
- 7384419: Fixed error on navigation to credential from chat, auto open dev mode from settings when triggered, fixed hanging wallet rename

## 2.0.1

### Patch Changes

- 498451c: Prevent unwanted duplicate initial storage loads and export AuthProvider lockUserOut function for reuse elsewhere if desired

## 2.0.0

### Major Changes

- 28386ff: Refactor to properly use AgentProvider and enable using multiple configurable themes. This includes changes to the provider tree, screen and component interfaces, a new hook, patches being updated / removed. Three screens that were being reused for distinct purposes were split so they had one use each, with sub components being created for the common content + logic between them to prevent duplicated code.

### Patch Changes

- 532d412: Updated proof request error popups

## 1.0.0

### Major Changes

- 43de99c: first major release of new @bifold packages
