# @bifold/core

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
