# Mobile Verifier 

This document reflects the implementation design of the verifier capability available in Aries Mobile Agent.

## Availability

By default, the Mobile Verifier functionality is hidden. In order to enable user needs to go into app Developer settings and toggle the corresponding button.

Also, by default, there are two predefined templates set in Aries Bifold (`Student full name` and `Student full name and expiration date`) for testing purpose.
On the application configuration level the set of proof request templates can be override if needed.

## Proof Request Templates location

**Current implementation** - application defines a static collection of possible templates.

** Future possible improvement** - have an ability to create new templates or add templates from a source, edit, delete, parametrize templates.
* How to store templates' collection?
    * Option 1: - store templates in the application storage
        * Create: 
          * Define a constant with predefined templates.
          * Write predefined templates into the application `store` (like we do with settings) on the application bootstrap.
        * Read: Read from the store on the App screens
        * Update/Delete: Use React actions to trigger store reducer
    * Option 2: - Create AFJ module for template managing operations (CRUD)  similar to existing ones (like connections, credentials, proofs, etc). 
         * Issue: 
           * AFJ modules represents protocols from Aries RFC's. 
           * AFJ maintainers may not want to include a such synthetic module for Proof Templates.
           * If AFJ maintainers reject this module we need to find a proper place to locate it. 
         * Create: 
           * Define a constant with a predefined templates. 
           * Write templates into AFJ repository on the bootstrap.
         * Read: Read from the AFJ store on the App screens
         * Update/Delete: Use AFJ methods from the new module

## Proof Request Template Structure

**Current implementation** - only `indy` proof request format is fully supported but the type definition for the Proof Request Template already includes the stub definition for `DIF` format.

Proof Request Template format approach: Define template structure closely to UI - Group requesting data by credential schema
 ```typescript
interface IndyProofRequestTemplatePayload {
    kind: 'indy'
    data: [
        {
            schema: string, // It's convinient to group reqeusted information by the credential schema
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
    data: [],
}

interface ProofRequestTemplate {
    id: string
    title: string
    details: string
    version: string
    payload: IndyProofRequestTemplatePayload | DifProofRequestTemplatePayload
}
```

**Example**:
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
                schema: 'YXCtXE4YhVjULgj5hrk4ML:2:verified_person:0.1.0',
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

## Proof Request parametrization

There is an ability to parametrize some proof request temples - for instance, change the value for a predicate. 

In order to achieve this we added optional flag (for instance `parameterizable`) identifying that the predicate value can be changed.
So that the template will contain some default values for predicates but if the flag is set as `true` the corresponding predicate value can be changed by the user.

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

## URL Shortening

The generated Proof Request link can be too big to put into QR, so we need to have a service for URL shortening as explained [here](https://github.com/hyperledger/aries-rfcs/tree/main/features/0434-outofband#url-shortening).

Right now we do not have such service available. \
In order to work around this issue at the first step, we can put JSON messages directly into QR codes.

Limitations:
* QR codes will be quite complex and difficult to read 
* There will be a limitation regarding the number of attributes that can be used in a Proof Request. Currently, testing showed that we can generate a request containing 10 attributes for each of them set a restriction by schema id. \
  > Hint: for indy proof request instead of defining multiple attributes restricted by the same schema you can use `names` filed in the proof request attribute data structure.

Aries Bifold Scanner updated to handle raw json messages -> pass them to AFJ message receiver.

## Proof processing state

* Currently, AFJ ProofRecord may have only two states: `RequestReceived` and `PresentationReceived`. There is no way to detect that proof received and its verification is in progress.
* In order to show the processing loader we need to new intermediate state `ProcessingPresentation` which will be raised by AFJ at the beginning of the Proof handler.  
* Very likely the state will be changed from `ProcessingPresentation` to `PresentationReceived` very quickly making UI flash. In this case, do we need to add some delay on the loader view?

> Issue: Created AFJ [issue](https://github.com/hyperledger/aries-framework-javascript/issues/1379)

## Contact History

* The existing application has a `Contact Chat` screen showdown only `basic` messages sent between parties.
* We want to evaluate this screen to include records about received credentials, shared/received proofs, and pending events also.
  * How to do: 
    * Mobile: Call AFJ methods to get Credentials/Proofs by a connection ID.
    * Join records into a single list by adding `type`, `role`, `text` fields depending on the record type and status (sent message, received message, received credential, received proof, etc.).
      ```
      {
        _id: record.id,
        type: record.type,
        text: actionLabel, // label for one of event 'MESSAGE_SENT' | 'MESSAGE_RECEIVED' | 'CREDENTIAL_REQUESTED' | 'CREDENTIAL_RECEIVED' | 'PROOF_REQUESTED' | 'PROOF_SENT' | 'PROOF_RECEIVED'
        createdAt: record.updatedAt || record.createdAt,
        user: { _id: role },
        time: record.updatedAt || record.createdAt
        data: <record>
      }
      ```
* Some events will also contain `Open` button tapping which a User will be able ti see the details of the event.

> Issue: Right now we are able to show only the latest event for a protocol instance (for instance `PROOF_RECEIVED` but not `PROOF_REQUESTED`). In order to show all event properly we need to do changes in Aries Framework JavaScript (see corresponding [issue](https://github.com/hyperledger/aries-framework-javascript/issues/1380)).

## Proof Request Template usage history

* In order to get the list of proofs received for a specific template we need to have an association between AFJ `ProofRecord` and `Template` records. It means that we need to add an optional `templateId` field to AFJ `ProofRecord` record.
* After that, we will be able to query the history of proofs for a specific template.
* For the current solution we used custom metadata of `ProofRecord` record. But there is no efficient method to query records with specific metadata filter. So we have to query all records and filer them on mobile side.

## Share Proof Request via link

Wrap request message into an app deep link and share it using some messenger.

## Proof Request multilingual labels 

We can use OCA approach for resolving dynamic labels as it is done for credentials.
Using that application can provide information for predefined templates.


