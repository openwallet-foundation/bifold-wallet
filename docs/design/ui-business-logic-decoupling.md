# Decoupling UI from Business Logic in Bifold

## Purpose

This spike investigates how Ontario Wallet can improve maintainability, scalability, and testability by separating React Native UI concerns from wallet business logic in Bifold.

The intent is not to replace Bifold's current architecture. The recommended path is an incremental architecture adjustment that keeps existing hooks, providers, dependency injection, extension points, and the mapper work already started, while moving protocol orchestration and Credo-specific decisions out of screens and reusable UI components.

## Summary

Bifold is already partway through decoupling:

- `packages/core/src/wallet/ui-types.ts` defines local card-facing UI types such as `WalletCredentialCardData`.
- `packages/core/src/wallet/map-to-card.ts` maps Credo/OpenID/DidComm credential records toward local card data.
- `packages/core/src/wallet/CardPresenter.tsx`, `Card10Pure`, and `Card11Pure` render cards from local data rather than directly from Credo records or OCA overlays.
- `packages/core/src/modules/openid/display.tsx` maps OpenID credential records to local display data.
- `packages/core/src/modules/openid/displayProof.tsx` maps OpenID proof requests to local submission display data.

This is useful, but incomplete. The current codebase still has several places where React screens and components consume Credo record classes directly, use `instanceof` to branch on protocol-specific record types, or render separate OpenID and DidComm card paths.

Recommended direction:

```text
Credo records / protocol records
  -> mapper layer
    -> local wallet/domain models
      -> view model hooks
        -> React Native screens/components
```

For full workflow decoupling, the mapper layer should later feed application use cases:

```text
Screen / Component
  -> view model hook
    -> use case / application service
      -> domain policy and mappers
      -> repositories / gateways
        -> Credo agent, storage, OCA resolver, network, history
```

## Current State Assessment

### Existing strengths

The project is not starting from zero.

- Dependency injection exists through `TOKENS` and `useServices`, with replaceable components, screens, hooks, and utilities in `packages/core/src/container-api.ts`.
- `MainContainer` registers defaults in one place, including OCA resolution, history, agent bridge, and OpenID refresh orchestration in `packages/core/src/container-impl.ts`.
- `packages/react-hooks/src/CredentialProvider.tsx`, `ProofProvider.tsx`, `ConnectionProvider.tsx`, and related providers centralize record subscription and selector logic.
- OpenID refresh is modeled as a headless orchestrator that binds to the active agent through `AgentBridge`, demonstrating the desired shape for complex non-UI workflows.
- Bifold's component architecture documentation already recognizes three component types: UI elements, screens, and services in `docs/components/readme.md`.
- A local wallet card mapper exists and is used by the newer card architecture.

### Current mapper layer

The active card mapping path is:

```text
CredentialCardGen
  -> mapCredentialTypeToCard
    -> WalletCredentialCardData
      -> WalletCredentialCard
        -> Card10Pure / Card11Pure
```

Key files:

- `packages/core/src/wallet/ui-types.ts`
- `packages/core/src/wallet/map-to-card.ts`
- `packages/core/src/wallet/CardPresenter.tsx`
- `packages/core/src/components/misc/CredentialCardGen.tsx`
- `packages/core/src/components/misc/Card10Pure.tsx`
- `packages/core/src/components/misc/Card11Pure.tsx`

This is the right direction because the pure cards render from `WalletCredentialCardData` instead of directly resolving OCA bundles or reading Credo records.

However, the mapper boundary is still not a full anti-corruption layer. `mapCredentialTypeToCard` currently accepts `GenericCredentialExchangeRecord`, which is a union of Credo classes:

- `DidCommCredentialExchangeRecord`
- `W3cCredentialRecord`
- `W3cV2CredentialRecord`
- `SdJwtVcRecord`
- `MdocRecord`

The mapper also branches with `instanceof` against Credo classes. That is acceptable inside a mapper/infrastructure boundary, but it should not leak into screens/components.

### OpenID decoupling state

OpenID has the strongest local mapping work:

- `display.tsx` maps OpenID credential records into `W3cCredentialDisplay`.
- `displayProof.tsx` maps OpenID proof requests into `FormattedSubmission`.
- `types.tsx` defines local display and submission types.
- OpenID proof presentation uses `CredentialCardGen` for selected credentials.

OpenID is still partial:

- `OpenIDCredentialCard.tsx` is a parallel OpenID-specific card path that bypasses the shared card mapper.
- `OpenIDCredentialOffer.tsx` and `OpenIDCredentialDetails.tsx` still use `OpenIDCredentialCard`.
- OpenID screens and hooks still pass `OpenIDCredentialRecord` around directly.

### DidComm decoupling state

DidComm is less decoupled than OpenID:

- DidComm card rendering has moved toward `CredentialCardGen`.
- DidComm screens still hold and reason over Credo records directly.
- DidComm proof request logic still lives heavily inside `ProofRequest.tsx`.
- DidComm notifications still branch over `DidCommCredentialExchangeRecord` and `DidCommProofExchangeRecord`.

Important examples:

- `ListCredentials.tsx` builds a mixed `GenericCredentialExchangeRecord[]` and branches with `instanceof` for navigation.
- `CredentialDetails.tsx` stores `DidCommCredentialExchangeRecord` in component state and mutates metadata.
- `CredentialOffer.tsx` accepts/declines offers directly through Credo APIs.
- `ProofRequest.tsx` contains credential selection, revocation checks, proof format construction, accept/decline/cancel, and history logic.
- `NotificationListItem.tsx` handles raw DidComm credential/proof records in UI.

## Problem Area Examples

### Credential offer flow

`packages/core/src/screens/CredentialOffer.tsx` combines several responsibilities:

- Fetch and patch offer format data from Credo.
- Resolve presentation fields and OCA overlays.
- Build and save history records.
- Accept a credential offer through Credo.
- Decline an offer, send a problem report, log history, and navigate home.

Impact:

- The screen is hard to unit test without React, navigation, Credo, OCA, history, and event emitter mocks.
- Regional teams that need different acceptance or history behavior must fork or override a large screen instead of swapping a focused policy or use case.

### Proof request flow

`packages/core/src/screens/ProofRequest.tsx` contains substantial business logic:

- Proof lifecycle decisions and navigation behavior based on proof state.
- Attestation and credential provisioning event handling.
- Revoked credential interval decision logic.
- Credential selection and missing credential calculation.
- Personally identifiable attribute detection through OCA data.
- History record creation.
- Accepting AnonCreds and PEX proof requests.
- Decline/cancel flows with problem reports and connection cleanup.
- Share-disabled policy calculation.

Impact:

- Protocol-specific details leak into the view.
- The criteria for enabling or disabling sharing are not available as an independently testable policy.
- PEX, AnonCreds, history, connection cleanup, and modal state are coupled in one file.

### Credential details flow

`packages/core/src/screens/CredentialDetails.tsx` mixes display, record access, metadata repair, revocation state, persistence, deletion, history, and notification behavior.

Impact:

- UI state changes are interleaved with durable record updates.
- The revocation "seen" and "dismissed" rules cannot be tested without mounting the screen.
- A simple details screen owns persistence behavior.

### Contact removal

`packages/core/src/screens/ContactDetails.tsx` performs connection cleanup directly:

- Builds the removable credential list inside the view.
- Creates history records.
- Queries basic messages, proofs, and offers, then deletes each record and the connection.

Impact:

- Deletion order and failure handling are embedded in the UI.
- Other teams cannot reuse contact cleanup without reusing this screen.
- The screen has to understand multiple record repositories.

### OpenID presentation

`packages/core/src/modules/openid/screens/OpenIDProofPresentation.tsx` uses non-UI helpers, but still owns selection construction and submission.

`packages/core/src/modules/openid/hooks/openid.tsx` contains a large OpenID4VCI receive workflow inside a React hook:

- Resolve offer.
- Obtain token.
- Receive credential.
- Create refresh metadata.
- Emit errors.

Impact:

- The OpenID hook is not merely state selection; it performs workflow orchestration and error mapping.
- The same workflow is harder to reuse from background tasks, tests, or alternate UI.

## Dead or Legacy Card Code

Likely dead or stale based on import scan:

- `packages/core/src/components/misc/CredentialCard10.tsx`
- `packages/core/src/domain/WalletCredential.ts`
- `packages/core/src/modules/openid/components/CredentialRowCard.tsx`
- `packages/core/src/components/misc/CredentialCard11ActionFooter.tsx`

Still used, but legacy/specialized:

- `OpenIDCredentialCard.tsx`: used by OpenID offer/details screens, but bypasses the shared mapper/card path.
- `VerifierCredentialCard.tsx`: used by proof request template/details flows.
- `CredentialCard11Logo.tsx` and `CredentialCard11Issuer.tsx`: used by `VerifierCredentialCard`.

Potential naming issue to verify:

- `CardPresenter.tsx` maps `Branding10` to `Card11Pure`; this may be intentional naming drift, but should be confirmed before cleanup.

## Target Architecture Options

### Option 1: Complete the mapper/local-model layer first

Finish mapping Credo-specific records into local models before doing larger use-case architecture work.

Pros:

- Directly continues the work already started.
- Reduces UI/Credo coupling with lower risk.
- Gives DidComm and OpenID screens a common model.
- Makes dead card cleanup easier.

Cons:

- Does not by itself decouple workflow orchestration.
- Screens may still own accept/decline/delete logic until later phases.

Use for:

- Credential cards.
- Credential lists.
- Credential details display state.
- Proof request display state.

### Option 2: Hooks-only refactor

Move logic from screens into custom hooks such as `useCredentialOfferViewModel` and `useProofRequestViewModel`.

Pros:

- Lowest disruption.
- Natural fit for React developers.
- Can reduce screen size quickly.

Cons:

- Logic remains React-coupled.
- Harder to reuse from non-UI contexts.
- Business behavior may still depend on React lifecycle and hooks.

Use for:

- Lightweight state derivation and presentation state.
- Transitional extraction when a full use case boundary would be too large.

### Option 3: Application services / use cases behind view model hooks

Create framework-light use case classes or factory functions for wallet flows. Screens consume view model hooks; hooks call use cases.

Pros:

- Best fit for current Bifold structure once local models are stable.
- Use cases can be unit tested without React Native.
- Reuses existing `TOKENS`, `useServices`, `AgentBridge`, and provider patterns.
- Allows Ontario Wallet and other regions to override policies or services without forking entire screens.

Cons:

- Requires new conventions.
- Needs disciplined boundaries so hooks do not become the new business layer.

Use for:

- Credential offer accept/decline.
- Proof request review/share/decline.
- Credential deletion and revocation metadata updates.
- Contact removal.
- OpenID offer and presentation workflows.

### Option 4: Feature modules with Clean Architecture boundaries

Organize each wallet feature into explicit `domain`, `application`, `infrastructure`, and `ui` folders.

Pros:

- Strongest separation and long-term scalability.
- Clear ownership and test structure.
- Useful for high-complexity protocol areas.

Cons:

- Higher migration cost.
- More boilerplate if applied mechanically.
- Could conflict with Bifold's current extension model if introduced all at once.

Use for:

- New or high-risk modules such as OpenID, refresh, verifier, and proof presentation.
- Areas where multiple regions need different rules.

## Recommended Target Architecture

Adopt a staged approach:

1. Clean up dead card code.
2. Complete the local mapper/model layer.
3. Migrate all credential cards to the shared mapper path.
4. Add local list/detail/proof display models.
5. Unify DidComm and OpenID screens around those local models.
6. Introduce use cases for workflow orchestration.

## Moving to MVVM Kind of Architecture with Next Steps

The mapper/local-model work is a practical foundation for moving Bifold toward an MVVM-style architecture.

This should be treated as "MVVM kind of architecture" rather than strict textbook MVVM because Bifold is a React Native application with hooks, context providers, dependency injection, and protocol-specific agents. In this codebase, ViewModels should likely be implemented as focused hooks that expose screen-ready state and user-intent callbacks.

Recommended shape:

```text
Credo / OCA / storage / network
  -> repositories and gateways
    -> mappers
      -> local wallet models
        -> view model hooks
          -> screens and components
```

### Why the mapper work helps MVVM

MVVM depends on the View consuming stable presentation state instead of raw infrastructure objects. The current mapper work helps because:

- `WalletCredentialCardData` gives card views a local display contract.
- `map-to-card.ts` starts isolating Credo and OCA details from card rendering.
- `Card10Pure` and `Card11Pure` are close to true Views because they render local data.
- OpenID display helpers already map protocol records into local display types.

The current gap is that ViewModels are implicit and scattered. Some ViewModel responsibilities live in screens, some in hooks, and some in `CredentialCardGen`.

### Proposed MVVM roles in Bifold

#### View

Examples:

- Screens under `packages/core/src/screens`
- Pure components such as `Card10Pure`, `Card11Pure`, `Record`, buttons, modals, and list items

Responsibilities:

- Render state.
- Forward user actions.
- Show loading, empty, success, and error states.
- Avoid direct Credo calls.
- Avoid protocol-specific branching.

#### ViewModel

Likely implemented as hooks.

Examples:

- `useCredentialListViewModel()`
- `useCredentialDetailsViewModel(credentialId)`
- `useCredentialOfferViewModel(credentialId)`
- `useProofRequestViewModel(proofId)`
- `useOpenIdProofPresentationViewModel(requestRecord)`
- `useContactDetailsViewModel(connectionId)`

Responsibilities:

- Load local display models.
- Expose screen-ready state.
- Expose user-intent callbacks such as `accept`, `decline`, `remove`, `share`, `selectCredential`, and `dismiss`.
- Translate use-case outcomes into navigation or UI events.
- Map technical errors to UI-facing errors.

#### Model

In Bifold this should include local domain/display models, not Credo records directly.

Examples:

- `WalletCredential`
- `WalletCredentialCardData`
- `WalletCredentialListItem`
- `WalletProofRequest`
- `WalletProofCredentialOption`
- `WalletNotification`

Responsibilities:

- Represent wallet concepts in Bifold terms.
- Hide whether data came from DidComm, OpenID, SD-JWT, mdoc, or W3C VC records.
- Give regional teams stable extension points.

#### Use cases and repositories

These sit below ViewModels. They are not strictly part of MVVM, but they keep ViewModels small and testable.

Examples:

- `AcceptCredentialOfferUseCase`
- `DeclineCredentialOfferUseCase`
- `ShareProofUseCase`
- `DeclineProofUseCase`
- `RemoveCredentialUseCase`
- `RemoveContactUseCase`
- `CredentialRepository`
- `ProofRepository`
- `ConnectionRepository`

Responsibilities:

- Execute business workflows.
- Call Credo APIs.
- Persist metadata.
- Log history.
- Apply policy decisions.
- Return typed outcomes to ViewModels.

### MVVM migration next steps

1. **Declare the current mapper/card path as the first MVVM-aligned slice**

   Treat `WalletCredentialCardData` plus pure card components as the reference pattern for View-facing models.

2. **Move mapping out of visual components**

   `CredentialCardGen` currently performs mapping and rendering. Split this into a ViewModel/container layer and a pure card View:

   ```text
   useCredentialCardViewModel(recordId or local model)
     -> WalletCredentialCardData
       -> WalletCredentialCard
   ```

3. **Create local credential list items**

   Replace mixed `GenericCredentialExchangeRecord[]` usage in `ListCredentials` with `WalletCredentialListItem[]`.

   The screen should not need to know whether an item is `W3cCredentialRecord`, `SdJwtVcRecord`, `MdocRecord`, or `DidCommCredentialExchangeRecord`.

4. **Introduce `useCredentialListViewModel`**

   This hook should combine DidComm and OpenID credentials, sort them, hide configured credentials, and expose navigation metadata without leaking Credo classes to the screen.

5. **Introduce `useCredentialDetailsViewModel`**

   The details screen should consume a local credential detail model and callbacks such as `removeCredential`, `dismissRevocationMessage`, and `viewIssuer`.

6. **Introduce `useCredentialOfferViewModel`**

   Move offer display preparation, accept, decline, history logging, and error mapping behind a ViewModel and use cases.

7. **Introduce `useProofRequestViewModel`**

   Move proof credential selection, missing credential calculation, revoked credential checks, share-disabled reasons, and accept/decline/cancel callbacks out of `ProofRequest.tsx`.

8. **Unify OpenID and DidComm proof display models**

   Add local proof models so DidComm and OpenID proof screens can render common concepts:

   - requester/verifier
   - purpose
   - requested credentials
   - satisfied status
   - selected credential
   - alternative credentials
   - missing or revoked credential states

9. **Move business workflows into use cases**

   Keep ViewModels focused on screen state. Move durable operations into use cases:

   - accept credential offer
   - decline credential offer
   - share proof
   - decline proof
   - remove credential
   - remove contact

10. **Define completion criteria for MVVM readiness**

    A screen is MVVM-aligned when:

    - It renders local ViewModel state.
    - It does not import Credo record classes.
    - It does not call `agent.modules...`.
    - It does not construct protocol payloads.
    - It does not mutate persisted record metadata.
    - User actions call ViewModel callbacks.
    - ViewModel behavior is testable without rendering the full screen.

### Layer responsibilities

#### UI components

Responsibilities:

- Render visual state.
- Capture user input.
- Call view model callbacks.
- Navigate based on typed outcomes supplied by the view model.

Should not:

- Call `agent.modules...` directly.
- Build protocol-specific request payloads.
- Mutate Credo records or metadata.
- Decide domain policies such as whether a proof can be shared.
- Emit global errors directly except through a UI notification adapter.

#### Mapper layer

Responsibilities:

- Convert Credo/OpenID/DidComm records into local wallet models.
- Hide Credo class differences from UI.
- Normalize credential display fields, issuer, branding, status, dates, attributes, and proof context.
- Own `instanceof` checks against Credo classes where unavoidable.

Example mapper functions:

- `mapDidCommCredentialToWalletCredential`
- `mapOpenIdCredentialToWalletCredential`
- `mapDidCommProofRequestToWalletProofRequest`
- `mapOpenIdProofRequestToWalletProofRequest`
- `mapWalletCredentialToCardData`

#### View model hooks

Responsibilities:

- Adapt mapper/use case results to screen state.
- Compose data from providers, theme, translation, and navigation parameters.
- Expose stable callbacks and typed loading/error state.
- Keep React-specific concerns out of application services.

Example names:

- `useCredentialListViewModel()`
- `useCredentialOfferViewModel(credentialId)`
- `useProofRequestViewModel(proofId)`
- `useCredentialDetailsViewModel(credentialId)`
- `useContactDetailsViewModel(connectionId)`
- `useOpenIdProofPresentationViewModel(requestRecord)`

#### Application services / use cases

Responsibilities:

- Orchestrate business workflows.
- Call repositories/gateways.
- Apply policies.
- Return typed results.
- Log and produce domain-level errors.

Example names:

- `CredentialOfferService.acceptOffer(input)`
- `CredentialOfferService.declineOffer(input)`
- `ProofRequestService.prepareReview(input)`
- `ProofRequestService.shareProof(input)`
- `ProofRequestService.declineProof(input)`
- `CredentialService.removeCredential(input)`
- `ContactService.removeContact(input)`
- `OpenIdCredentialService.receiveOffer(input)`
- `OpenIdProofService.sharePresentation(input)`

#### Infrastructure adapters

Responsibilities:

- Wrap Credo APIs.
- Wrap OCA resolver APIs.
- Wrap history persistence.
- Wrap global errors/toasts.
- Hide record implementation details.

Example adapters:

- `CredentialRepository`
- `ProofRepository`
- `ConnectionRepository`
- `BasicMessageRepository`
- `HistoryService`
- `OverlayService`
- `WalletNotificationService`

## Ten-Step Path to Reasonable Credo Decoupling

1. **Remove confirmed dead card/model code**

   Delete or deprecate unused files such as `CredentialCard10.tsx`, `domain/WalletCredential.ts`, `CredentialRowCard.tsx`, and unreferenced card footer/logo variants after visual/regression checks.

2. **Name the active card architecture**

   Make `wallet/ui-types.ts`, `wallet/map-to-card.ts`, `CardPresenter.tsx`, `Card10Pure`, `Card11Pure`, and `CredentialCardGen` the declared canonical card path.

3. **Clean up duplicate local card types**

   Keep one `WalletCredentialCardData` type. Remove older duplicate shapes and update imports so there is one local display contract.

4. **Finish the DidComm credential mapper**

   Add a focused `mapDidCommCredentialToCardData` or `mapDidCommCredentialToWalletCredential` path so DidComm screens stop passing raw `DidCommCredentialExchangeRecord` into card UI.

5. **Finish the OpenID credential mapper**

   Move remaining OpenID-specific card display logic from `OpenIDCredentialCard` into the shared mapper path, using `getCredentialForDisplay` as the OpenID source mapper.

6. **Replace OpenID-specific card rendering**

   Migrate `OpenIDCredentialOffer` and `OpenIDCredentialDetails` from `OpenIDCredentialCard` to `CredentialCardGen` or a new local-model-only `CredentialCard`.

7. **Make card components Credo-free**

   Change `CredentialCardGen` or its successor to accept local card/display models only. Credo records should be mapped before reaching visual components.

8. **Unify credential list screen inputs**

   Replace mixed `GenericCredentialExchangeRecord[]` logic in `ListCredentials` with a local `WalletCredentialListItem` model that includes id, protocol/source, display data, created date, and navigation target.

9. **Create local proof/request display models**

   Add mapper outputs for DidComm proof requests and OpenID proof requests so proof screens consume shared concepts like requester, purpose, requested credentials, satisfied status, selected credential, and available alternatives.

10. **Unify DidComm/OpenID screen patterns behind use cases**

    Introduce use-case services for credential details, credential offer accept/decline, proof review/share/decline, and credential deletion. Screens become thin adapters: load local models, render UI, invoke use cases, and navigate based on typed outcomes.

At the end of these steps, Credo should be largely isolated behind mappers, repositories, and use cases instead of leaking through UI components and screens.

## Testing Strategy

### Unit tests

Add focused tests for pure logic:

- DidComm credential to local wallet credential mapping.
- OpenID credential to local wallet credential mapping.
- Card data mapping.
- Credential selection and missing credential calculation.
- Revocation interval checks.
- Proof share-disabled reasons.
- History record construction.
- OpenID credential submission mapping.

### Service tests

Test use cases with mocked repositories:

- Accept credential offer calls accept, logs history, and returns success.
- Decline offer sends a problem report only when a connection exists.
- Share proof builds the correct proof format for AnonCreds and PEX.
- Remove contact deletes proofs, offers, messages, and connection with expected failure behavior.

### View model tests

Test hooks with React testing utilities where useful:

- Loading, success, error, and disabled states.
- Navigation outcomes are returned or requested correctly.
- UI-specific mapping is localized and stable.

### Screen tests

Keep screen tests shallow:

- Renders state from the view model.
- Buttons call expected callbacks.
- Modals open and close.

## Definition of Done for a Migrated Flow

A flow is considered decoupled when:

- The screen has no direct `agent.modules...` calls.
- The screen does not branch on Credo classes using `instanceof`.
- Protocol payload construction is outside JSX files.
- Durable record mutation is outside JSX files.
- Business policies have unit tests independent of React Native.
- Use cases can be tested with mocked repositories.
- UI components receive local display data and callbacks rather than infrastructure dependencies.
- Regional overrides can replace a policy, service, or component without forking the whole screen.

## Risks and Mitigations

| Risk                                    | Mitigation                                                                         |
| --------------------------------------- | ---------------------------------------------------------------------------------- |
| New layers add boilerplate              | Start with high-coupling flows only; do not wrap trivial UI state.                 |
| Hooks become the new business layer     | Keep hooks as adapters; put orchestration in use cases.                            |
| Mapper accepts Credo records forever    | Treat Credo-aware mapping as infrastructure; expose local models to UI only.       |
| Regional teams need different behavior  | Register policies/services through existing DI tokens.                             |
| Existing screens are large and fragile  | Migrate one flow at a time with characterization tests.                            |
| Error behavior changes during migration | Centralize error presentation but preserve existing `BifoldError` codes initially. |
| Navigation remains coupled to use cases | Use cases return outcomes; view models/screens perform navigation.                 |

## Role of Ontario Wallet Team

The Ontario Wallet team should:

- Lead the initial spike review using Ontario-specific pain points and examples from this investigation.
- Identify which coupling issues are blocking Ontario development or testing today.
- Propose the first migrated reference flow.
- Define Ontario-specific policies that should become injectable rather than hardcoded.
- Contribute reusable abstractions back to Bifold where they are broadly useful.

## Discussion Required with BC Team Managers

This spike should be reviewed with BC Team managers before implementation starts.

Decision topics:

- Confirm whether BC Team agrees with the incremental architecture.
- Confirm ownership of shared Bifold abstractions versus Ontario-specific extensions.
- Confirm whether mapper completion should happen before broader use-case extraction.
- Confirm the first migration candidate and expected timeline.
- Confirm testing expectations for migrated flows.
- Confirm whether new contribution guidelines should block new direct `agent.modules...` calls or Credo `instanceof` checks in UI files.

Recommended decision:

Proceed with an incremental migration. Start with dead card cleanup and completion of the local credential mapper layer, then migrate OpenID and DidComm credential screens to the shared local models. After the display layer is stable, introduce use-case services for credential offer, proof request, credential details, and contact removal workflows.
