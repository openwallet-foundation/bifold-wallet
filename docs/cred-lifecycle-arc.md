# OpenID Credential Refresh Lifecycle

> Information and architecture diagram for checking/refreshing OpenID credentials

## 📌 Overview

This diagram illustrates the wallet-side process for verifying the validity of an SD-JWT credential using a status list. The credential’s status is checked either periodically via background processing or in response to user actions, such as viewing, opening, or presenting the credential. If the credential is found to be invalid, the wallet attempts to use a previously stored refresh token to obtain a new access token, which is then used to request a fresh credential from the issuer. This ensures credentials remain up-to-date and trusted without requiring manual intervention.

## 🔄 SD-JWT Credential Status Flow – Wallet-Side

This system supports **robust, standards-based credential lifecycle management** within a digital wallet environment. It ensures Verifiable Credentials (VCs) based on **SD-JWT** remain valid, trustworthy, and up-to-date, using automated background and user-driven processes. Key features include:

- 🔐 **Stored Refresh Token Usage** – Enables silent access token renewal without re-authentication
- 🔎 **Status List Verification** – Periodic or on-demand checks against SD-JWT status lists to detect revoked or expired credentials ([draft-ietf-oauth-status-list](https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/))
- 🔁 **Refresh-on-Invalidation** – Automatic reissuance flow triggered when a credential is found to be invalid
- 📱 **Passive & Active Triggers** – Background checks or user-driven interactions (e.g., viewing, opening, presenting) initiate verification
- 🧠 **Credential State Caching** – Custom local state used to track validity, offer display, and user decision history
- 🎛️ **User Notification & UI Integration** – Dynamic in-app offer display, badge updates, and graceful credential replacement workflows

### 🔧 Wallet-Side Components

- **Background Process Manager**  
  Runs silent status list verification tasks on a schedule or system triggers.

- **User Event Hooks**  
  Checks are initiated when a user opens, views, or presents a credential.

- **Status List Resolver**  
  Efficiently parses and validates status bits for SD-JWT credentials.

- **Refresh Flow Handler**  
  Uses stored refresh tokens to retrieve new access tokens and request updated credentials without user interruption.

- **Custom Credential State Store**  
  Caches local metadata like credential status, active offers, and user decisions for UX continuity.

This design prioritizes **user transparency, reliability, and automation**, creating a seamless credential lifecycle experience within self-sovereign and wallet-driven ecosystems.

```mermaid
flowchart TD

  subgraph Core Framework
    A1[Background Process] --> A3[Check Credentials]
    A2[Event Based] --> A3

    A3 --> A4{Credential Invalid or New?}
    A4 -- Yes --> A5[Stop Credential]

    A4 -- No --> A6[Fetch Status List]
    A6 --> A7[Check Status List]
    A7 --> A8[Result Cases]

    A8 --> R1[Status List Valid\nNew Credential Available]
    A8 --> R2[Status List Invalid\nNew Credential Available]
    A8 --> R3[Status List Valid\nCredential Expired]

    subgraph Custom Credential State
      C1[Get]
      C2[Put]
    end

    A3 --> C1
    A8 --> C2
  end

  %% === Styling shared results ===
  style R1 fill:#e0ffe0,stroke:#008000,stroke-width:2px,color:#004400
  style R2 fill:#fff4e0,stroke:#e69500,stroke-width:2px,color:#805500
  style R3 fill:#ffe0e0,stroke:#cc0000,stroke-width:2px,color:#990000
```

```mermaid
flowchart TD

  subgraph UI_Development
    B1[App Status] --> B2[User Notification]
    B2 --> B3[Backgrounded]
    B2 --> B4[Foregrounded]
    B3 --> B5[User Action]
    B4 --> B5

    B6[Local PIN] --> B7[Home Screen Badges]
    B6 --> B8[Credential Badges]

    %% Display Offers from status results
    R1["Status List Valid<br/>New Credential Available"] --> D1[Display New Offer]
    R2["Status List Invalid<br/>New Credential Available"] --> D2[Display New Offer]
    R3["Status List Valid<br/>Credential Expired"] --> D2

    %% New shared outcomes
    Result_Unknown["Status List Unknown"] --> D3["Show 'Status Unknown' badge<br/>+ Retry Info"]
    Refresh_Failed["Refresh Failed"] --> D4["Prompt Re-Authenticate / Re-Authorize"]

    %% First path
    D1 --> U1[User Accept Offer] --> DEL1[Delete old credential]
    D1 --> U2[User declines or no response] --> END[Leave old credential<br/>End]

    %% Second path
    D2 --> U3[User Accept Offer] --> DEL2[Delete old credential]
    D2 --> U4[User declines or no response] --> INV[Set old credential state as invalid]
  end

  %% Style outcomes
  style R1 fill:#e0ffe0,stroke:#008000,stroke-width:2px,color:#004400
  style R2 fill:#fff4e0,stroke:#e69500,stroke-width:2px,color:#805500
  style R3 fill:#ffe0e0,stroke:#cc0000,stroke-width:2px,color:#990000
  style Result_Unknown fill:#e6f0ff,stroke:#3355cc,stroke-width:2px,color:#1d2e6b
  style Refresh_Failed fill:#fff4e0,stroke:#e69500,stroke-width:2px,color:#805500

  %% Style end actions
  style DEL1 fill:#d6f5d6,stroke:#008000,color:#003300
  style DEL2 fill:#d6f5d6,stroke:#008000,color:#003300
  style INV fill:#ffe6e6,stroke:#cc0000,color:#800000
  style END fill:#e6e6e6,stroke:#888888,color:#333333
```

## Refresh Token Lifecycle

```mermaid
sequenceDiagram
  participant Wallet
  participant CredentialIssuer
  participant AuthorizationServer
  participant DB
  participant StatusListService

  Note over Wallet, CredentialIssuer: After receiving an SD-JWT Credential

  Wallet->>Wallet: Extract `refresh_token` + `token_endpoint` from credential
  Wallet->>DB: Store refresh_token & endpoint in credential metadata

  Note over Wallet: Later (e.g. on open/view or background check)

  Wallet->>StatusListService: Check SD-JWT credential status
  alt Status list fetched successfully
    %% (your existing valid/invalid branching stays)
  else Network/error fetching status list
    Note over Wallet: Mark status = "unknown", schedule retry with exponential backoff
  end
  alt Status is valid
    Wallet->>Wallet: Use credential as normal
  else Status is invalid
    Wallet->>DB: Retrieve refresh_token + token_endpoint

    Wallet->>AuthorizationServer: POST /token
    Note over Wallet, AuthorizationServer: Includes:<br/>- grant_type=refresh_token<br/>- refresh_token<br/>- DPoP JWT<br/>- client_attestation JWT

    AuthorizationServer->>DB: Validate refresh_token
    AuthorizationServer-->>Wallet: new access_token + (optional) new refresh_token

    alt AuthorizationServer did not rotate refresh token
      Note over Wallet: Keep existing refresh_token until expiry per AS policy
    else AuthorizationServer rotated refresh token
      Wallet->>DB: Replace stored refresh_token with new one
    end

    %% Refresh failure paths
    opt Refresh token invalid/expired/revoked
      AuthorizationServer-->>Wallet: error (invalid_grant / invalid_token)
      Note over Wallet: Fall back to re-auth (authorization or pre-authorized code)
    end

    Wallet->>DB: Update credential metadata with new tokens

    %% Nonce retrieval is issuer-specific
    Wallet->>CredentialIssuer: Obtain nonce (if required by issuer)
    CredentialIssuer-->>Wallet: nonce (optional)

    Wallet->>CredentialIssuer: POST /credential
    Note over Wallet, CredentialIssuer: Includes:<br/>- new access_token<br/>- (DPoP-bound via cnf.jkt)<br/>- DPoP JWT (same key as bound token)<br/>- credential proof (bound to nonce or other issuer constraint)

    CredentialIssuer->>AuthorizationServer: Issuer validates access token (via introspection or JWT signature & claims).
    AuthorizationServer-->>CredentialIssuer: token metadata incl. cnf.jkt

    CredentialIssuer-->>Wallet: New SD-JWT Credential
  end
```

## 🔄 SD-JWT Credential Refresh Flow (Using Refresh Token)

After the wallet successfully obtains an SD-JWT credential from the credential issuer, it extracts the `refresh_token` and the `token_endpoint` (typically embedded within the credential or its metadata). These values are securely stored in the credential’s metadata for future use.

At a later point — triggered either by background processes or user interaction (e.g., viewing or presenting the credential) — the wallet checks the status of the credential using the associated **Status List**. If the credential is found to be **revoked or invalid**, the wallet initiates a refresh sequence:

### Steps:

1. **Retrieve Stored Tokens**  
   The wallet retrieves the `refresh_token` and `token_endpoint` from the credential’s metadata.

2. **Request New Access Token**  
   The wallet sends a `POST /token` request to the issuer's authorization server with:

   - `grant_type=refresh_token`
   - The `refresh_token`
   - DPoP proof
   - Client attestation (e.g., Firebase / App Attest)

3. **Store New Tokens**  
   If the request is successful, the wallet receives a new `access_token` (and possibly a new `refresh_token`) and stores them in the credential metadata.

4. **Request New Credential**  
   Using the new `access_token`, the wallet:

   - Retrieves a fresh `nonce` from the issuer via `GET /nonce`
   - Sends a `POST /credential` request with:
     - The `access_token`
     - DPoP proof
     - Credential proof (bound to the nonce)

5. **Receive New Credential**  
   The credential issuer performs token introspection and verification, then issues a new SD-JWT credential to the wallet.

This flow ensures the wallet can self-recover from revoked credentials and maintain up-to-date verifiable credentials without requiring manual user intervention.

## 🔐 Storing Refresh Tokens in the Wallet

When handling SD-JWT credentials with refresh capabilities, the wallet must securely store the **refresh token** (and optionally the access token) received during issuance. This token is later required for:

- Credential status checks
- Requesting a new credential after revocation

There are two main options for storing this token in the wallet:

---

### ✅ Store Token in Credential Metadata (as JSON)

Using helper methods like the following:

```ts
/**
 * Gets the refresh credential metadata from the given credential record.
 */
export function getRefreshCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord
): RefreshCredentialMetadata | null {
  return credentialRecord.metadata.get(refreshCredentialMetadataKey)
}

/**
 * Sets the refresh credential metadata on the given credential record
 */
export function setRefreshCredentialMetadata(
  credentialRecord: W3cCredentialRecord | SdJwtVcRecord | MdocRecord,
  metadata: RefreshCredentialMetadata
) {
  credentialRecord.metadata.set(refreshCredentialMetadataKey, metadata)
}
```

### ✅ Advantages of Option 1: Store Token in Credential Metadata

- ✅ Easy to implement using existing wallet data structures
- ✅ Supports background processing without requiring user interaction
- ✅ Cross-platform compatibility with no native dependencies
- ✅ Flexible and accessible from credential context
- 🟡 Security depends on wallet’s internal data protection mechanisms

## 🔄 SD-JWT Credential Status Verification

### ✅ Overview

This flow describes how the wallet verifies the status of a received SD-JWT credential using the status list URI and index. If the credential is marked as revoked, the wallet can optionally trigger a refresh or reissuance flow (not shown here).

The process involves:

- Decoding the SD-JWT
- Extracting and modifying the payload to include a status list reference (URI + index)
- Reconstructing the JWT
- Fetching the remote status list JWT
- Extracting the status list bitmap
- Verifying the revocation status of the specific credential index

### Sequence Diagram: SD-JWT Status List Check

```mermaid
sequenceDiagram
  participant Wallet
  participant StatusListServer

  Wallet->>Wallet: Parse SD-JWT (split into header, payload, signature, disclosures)
  Wallet->>Wallet: Decode payload JSON
  Wallet->>StatusListServer: Fetch status list JWT (GET /statuslist.jwt)
  StatusListServer-->>Wallet: Return JWT with bitstring
  Wallet->>Wallet: Decode JWT and extract status bit array
  Wallet->>Wallet: Lookup index (e.g. 0) to check if credential is revoked
  Wallet-->>Wallet: Log and return result (valid or revoked)
```

## 🔑 Key Functions for SD-JWT Status List Verification

These are the core functions used in the wallet to verify whether an SD-JWT credential has been revoked using the associated status list:

```ts
// Extract the status list URI and index from the SD-JWT
const reference = getStatusListFromJWT(newCompactJwt)

// Fetch the status list JWT from the issuer
const response = await fetch(reference.uri)

// Decode the status list and obtain the bit array
const statusList = getListFromStatusListJWT(jwt)
```

### 📋 Credential Status Handling Overview

When performing a **Status List check** on an SD-JWT or other verifiable credential, the wallet determines the next action based on the credential’s revocation or suspension state and the availability of a replacement credential. This ensures a seamless user experience while maintaining trust and validity of stored credentials.

### Possible Outcomes

1. **✅ Credential status is valid**

   - Keep the current credential without changes.
   - No further action required until the next scheduled status check.

2. **♻️ Credential status is invalid and a new credential is available**

   - Initiate a credential refresh flow using the stored refresh token and issuer endpoint.
   - Replace the outdated credential with the new one.

3. **⚠️ Credential status is invalid and no new credential is available**
   - Follow the wallet’s UX guidelines, e.g.,
     - Display a badge or warning icon.
     - Restrict credential usage in proof presentations.
     - Notify the user about the issue and possible next steps.

### 📄 Sample Status List JSON

Below is an example of a decoded **Status List** payload, showing how credential revocation states are represented.

```json
{
  "status_list": {
    "id": "https://issuer.example.com/statuslist/2025-08.jwt",
    "type": "StatusList2021",
    "encodedList": "H4sIAAAAAAAA_1MwzUjOyS9KzEtXyU9VslIqzEvxUVDwTSwuLU4syczPBgAHeY5FjAAAAA",
    "length": 16,
    "index": 42
  },
  "issuer": "https://issuer.example.com",
  "issued": "2025-08-08T10:00:00Z"
}

**Key Fields:**

- **`id`** – The URI where the status list can be retrieved.
- **`encodedList`** – Compressed bitstring representing the status of each credential in the list.
- **`index`** – Position of the credential in the bitstring.
- **`issuer`** – The entity maintaining the status list.
- **`issued`** – Timestamp when the list was last updated.
```
