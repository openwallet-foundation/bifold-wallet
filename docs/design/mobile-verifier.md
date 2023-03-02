# Mobile Verifier 

This document contains a proposed design of adding verifier functionality to Aries Mobile Agent.

## Availability

For Aries Bifold the Mobile Verifier functionality will be hidden under Developer mode by default.
Also, by default, there will not be any templates set. It's the application's responsibility to define default templates if needed.

> Changes in Aries Bifold

## Proof Request Templates location

For the initial implementation, it's enough to have just a static collection of possible templates.
In the future, we want to be able to add the ability to create new templates / add templates from a source/edit / delete/parametrize templates.
* How to store templates' collection?
    * Option 1: - temporary solution just to start UI development
        * Create: Define a constant variable in the mobile application
        * Read: Read the constant on the App screens (add getter or hook which implementation will be changed later)
        * Edit/Delete: No
    * Option 2: - store templates in the application storage
        * Create: 
          * Define a constant with predefined templates.
          * Write predefined templates into the application `store` (like we do with settings) on the application bootstrap.
        * Read: Read from the store on the App screens
        * Update/Delete: Use React actions to trigger store reducer
    * Option 3: - Create AFJ module for template managing operations (CRUD)  similar to existing ones (like connections, credentials, proofs, etc). 
         * Issue: 
           * AFJ modules represents protocols from Aries RFC's. 
           * AFJ maintainers may not want to include a such synthetic module for Proof Templates.
           * If AFJ maintainers reject this module we need to find a proper place to locate it. 
         * Create: 
           * Define a constant with a predefined templates. 
           * Write templates into AFJ repository on the bootstrap.
         * Read: Read from the AFJ store on the App screens
         * Update/Delete: Use AFJ methods from the new module

> Proposal: start with Option 1 to unblock Mobile UI works. Implement selected option as the next steps. \
> Recommendation: Use Option 3 as more graceful and flexible way of storing collections, similar to other lists. But we should try to propose Proof Templates as Aries RFC and make it as standard concept.  

> Option 2 means changes in Aries Bifold
> Option 3 means changes in Aries Framework JavaScript and Aries Bifold
         
## Proof Request Template Structure

> Question: Do we want to support only `indy` proof format or `v2 DIF Presentation exchange` as well?
> Question: Do we want the template define the proof format type (`indy` or `dif`) or the same template can be used for both format types? Should  a user be able to select type of the request?

> Proposal: Start with supporting `indy` format only but define the structure to support both types.

* Option 1: Define template structure closely to UI - Group requesting data by schema
 ```typescript
interface IndyProofRequestTemplatePayload {
    kind: 'indy'
    data: [
        {
            schema: string, // For UI
            requestedAttributes?: [
                {
                    name?: string,
                    names?: Array<string>,
                    restrictions?: [any],
                    revealed?: boolean,
                    nonRevoked?: boolean
                }
            ]
            requestedPredicates?: [
                {
                    name: string,
                    predicateType: string,
                    predicateValue: number,
                    restrictions?: [any],
                    nonRevoked?: boolean
                }
            ]
        },
        {
            schema: 'Schema Name 2',
            //....
        }
    ]
}

interface DifProofRequestTemplatePayload {
    kind: 'dif'
    data: [], // TODO
}

interface ProofRequestTemplate {
    id: string
    title: string
    details: string
    version: string
    payload: IndyProofRequestTemplatePayload | DifProofRequestTemplatePayload
}
```

* Option 2: Define template structure closely to the format of AFJ Proof API. We need to extract schema from `restrictions` and we need always group attributes/predicates by schema for each render?
 ```typescript
interface IndyProofRequestTemplatePayload {
    kind: 'indy'
    requestedAttributes?: any
    requestedPredicates?: any
}

interface DifProofRequestTemplatePayload {
    kind: 'dif'
    // TODO
}

interface ProofRequestTemplate {
    id: string
    title: string
    details: string
    version: string
    payload: IndyProofRequestTemplatePayload | DifProofRequestTemplatePayload
}
 ```

> Recommendation: Use Option 1 as more flexible and convenient format from mobile point of view.

Example of Proof Request Template built according to the Option 1:
```typescript
const tempalte = {
    id: '3339c1e1-681f-433c-9f2f-8d0d1af0b3d2',
    title: '19+ and Full name',
    details: 'Verify if a person is 19 years end up and full name.',
    version: '0.0.1',
    payload: {
        kind: 'indy',
        data: [
            {
                schema: 'Verified Person Schema',
                requestedAttributes: [
                    {
                        "name": "given_names",
                    },
                    {
                        "name": "family_name",
                    }
                ],
                requestedPredicates: [
                    {
                        "name": "age",
                        "predicateType": ">=",
                        "predicateValue": 19,
                    }
                ]
            }
        ]
    }
}
```

> Place of changes depends on the previous point 


## Proof Request parametrization

We want to have an ability parametrize the proof request temple - for instance, change the value for a predicate.

In order to achieve this we need to add some flag (for instance `parameterizable`) identifying that the predicate value can be changed.
So the template will contain some default values for predicates but if the flag set as `true` corresponding predicate value can be changed by the user.

```typescript
interface IndyRequestedPredicate {
    name: string,
    predicateType: string,
    predicateValue: string,
    restrictions?: [any],
    nonRevoked?: boolean,
    parameterizable?: boolean
}
```

> Issue: As template name (Schema) may include value from predicate (like `19+ and Full name`) we either need use more generic titles or replace value in predicate (breaks )

## Proof Request Generation

Due to the [issue](https://github.com/hyperledger/aries-framework-javascript/issues/1250) at Aries Framework JavaScript we cannot use Out-of-Band protocol covering both possible cases (with connection / connectionless).

Instead, we have to use two legacy approaches to cover our cases: 
* Case 1: Connectionless proof. 
  * We can use legacy connectionless proof format when `~service` decorator is included in the request ([RFC](https://github.com/hyperledger/aries-rfcs/tree/main/features/0056-service-decorator)).
      ```typescript
      const { message, proofRecord } = await this.agent.proofs.createRequest({
          protocolVersion: 'v1',
          autoAcceptProof: AutoAcceptProof.Always,
          proofFormats: buildIndyProofData(template),
      })
    
      const { invitationUrl } = await this.agent.oob.createLegacyConnectionlessInvitation({
          recordId: proofRecord.id,
          message,
          domain: 'https://??????.com', // what domain should be used here??? URL Shortere?
      })
      ```
* Case 2: Request proof from a specific connection.
     ```typescript
        await this.agent.proofs.requestProof({
            protocolVersion: 'v1',
            connectionId: connectionRecord.id,
            proofFormats: buildIndyProofData(template),
        })
    ```

> Changes in Aries Bifold

## URL Shortening

The generated Proof Request link can be too big to put into QR, so we need to have a service for URL shortening as explained [here](https://github.com/hyperledger/aries-rfcs/tree/main/features/0434-outofband#url-shortening).

Right now we do not have such service available. \
In order to work around this issue at the first step, we can put JSON messages directly into QR codes.\
Limitations:
* QR codes will be quite complex and difficult to read 
* There will be a limitation regarding the number of attributes that can be used in a Proof Request.

We will need to update Aries Bifold Scanner to handle raw json messages -> pass them to AFJ message receiver.

> Changes in Aries Bifold

## Proof processing state

* Currently, AFJ ProofRecord may have only two states: `RequestReceived` and `PresentationReceived`. There is no way to detect that proof received and its verification is in progress.
* In order to show the processing loader we need to new intermediate state `ProcessingPresentation` which will be raised by AFJ at the beginning of the Proof handler.  
* Very likely the state will be changed from `ProcessingPresentation` to `PresentationReceived` very quickly making UI flash. In this case, do we need to add some delay on the loader view?

> Changes in Aries Framework JavaScript
> Changes in Aries Bifold

## Contact History

* The existing application has a `Contact Chat` screen showdown only `basic` messages sent between parties.
* We want to evaluate this screen to include records about received credentials, shared/received proofs, and pending events also.
  * How to do: 
    * Mobile: Call AFJ methods to get Credentials/Proofs by a connection ID.
    * Join records into a single list by adding `event_type` field depending on the record type and status (sent message, received message, received credential, received proof, etc.).
      ```
      {
        event_type: 'MESSAGE_SENT' | 'MESSAGE_RECEIVED' | 'CREDENTIAL_REQUESTED' | 'CREDENTIAL_RECEIVED' | 'PROOF_REQUESTED' | 'PROOF_SENT' | 'PROOF_RECEIVED'
        time: record.updatedAt || record.createdAt
        data: <record>
      }
      ```
* Some events will also contain `Open` button tapping which a User will able ti see the details of the event.

> Changes in Aries Bifold

## Proof Request Template usage history

* In order to get the list of proofs received for a specific template we need to have an association between AFJ `ProofRecord` and `Template` records. It means that we need to add an optional `templateId` field to AFJ `ProofRecord` record.
* After that, we will be able to query the history of proofs for a specific template.

> Changes in Aries Bifold

## Share Proof Request via link

Does the Bifold supports deeplink?
If yes - we will need to wrap the request message into an app deep link and share it using some messenger.

> Changes in Aries Bifold

## Proof Request multilingual labels 

We can define localization for attributes/predicates from predefined templates.
But How to do it for dynamically added templates in the future? - TBD

> Changes in Aries Bifold



