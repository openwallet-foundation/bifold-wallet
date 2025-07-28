import { useNavigation } from '@react-navigation/native'
import { cleanup, fireEvent, render, act } from '@testing-library/react-native'
import React from 'react'
import { testIdWithKey } from '../../src/utils/testable'
import { BasicAppContext } from '../helpers/app'
import JSONDetails from '../../src/screens/JSONDetails'
import Clipboard from '@react-native-clipboard/clipboard'
import { Share } from 'react-native'
import Toast from 'react-native-toast-message'
import { ToastType } from '../../src/components/toast/BaseToast'

jest.mock('@react-native-clipboard/clipboard')
jest.spyOn(Share, 'share').mockImplementation(jest.fn())
jest.spyOn(Toast, 'show').mockImplementation(jest.fn())

jest.useRealTimers()

const jsonBlob = `{
  "_tags": {
    "anonCredsCredentialRevocationId": "712",
    "anonCredsRevocationRegistryId": "did:indy:bcovrin:test:QEquAHkM35w4XVT3Ku5yat/anoncreds/v0/REV_REG_DEF/834674/member_card/3ccbf09e-1d5e-4484-a906-86cca6809a39",
    "anonCredsUnqualifiedRevocationRegistryId": "QEquAHkM35w4XVT3Ku5yat:4:QEquAHkM35w4XVT3Ku5yat:3:CL:834674:member_card:CL_ACCUM:3ccbf09e-1d5e-4484-a906-86cca6809a39",
    "connectionId": "abb78f2d-887f-4fdf-bdf3-5ceb0635a32b",
    "credentialIds": [
      "19d9ac9a-1bc6-468c-b6ab-8693c20a392d"
    ],
    "role": "holder",
    "state": "done",
    "threadId": "d731ad63-dbe0-4c2e-a09a-21da3f0075b6"
  },
  "metadata": {
    "_anoncreds/credentialRequest": {
      "link_secret_blinding_data": {
        "v_prime": "12558773405074986407016595755241195883585779298582197944359249133865516016194613099767720410485680081743270874834017963311561019043224403447871278209091147039916466337112528947479366499888501586461830241682366172465715848761522159899079494671142161829575233674895307880988572289916781251544511562158623409488178204177240603595488837714704523136331508652697210478698797729843348277225169275100843643358846942895804457070602440440792748829796565199381305645795934116742717037341472565117176530625111703271008556298303087440031396822606652491380349684609402532631859436252512176801201030553690693417528622326283838533756817531187410658514180224",
        "vr_prime": "07E3F3B42E72F43F4F7D35E51AAB90A43E11F953FB023074F88E16CFFFE6D912"
      },
      "nonce": "543894974289883359961803",
      "link_secret_name": "85772c8c-cca9-4055-9ec9-5fc53db296e6"
    },
    "_anoncreds/credential": {
      "credentialDefinitionId": "QEquAHkM35w4XVT3Ku5yat:3:CL:834674:member_card",
      "schemaId": "QEquAHkM35w4XVT3Ku5yat:2:member_card:1.54",
      "credentialRevocationId": "712",
      "revocationRegistryId": "did:indy:bcovrin:test:QEquAHkM35w4XVT3Ku5yat/anoncreds/v0/REV_REG_DEF/834674/member_card/3ccbf09e-1d5e-4484-a906-86cca6809a39"
    }
  },
  "credentials": [
    {
      "credentialRecordType": "w3c",
      "credentialRecordId": "19d9ac9a-1bc6-468c-b6ab-8693c20a392d"
    }
  ],
  "id": "911baea9-3984-4a93-92a9-1735eaf3e372",
  "createdAt": "2025-06-16T16:16:45.341Z",
  "state": "done",
  "role": "holder",
  "connectionId": "abb78f2d-887f-4fdf-bdf3-5ceb0635a32b",
  "threadId": "d731ad63-dbe0-4c2e-a09a-21da3f0075b6",
  "protocolVersion": "v1",
  "updatedAt": "2025-06-16T16:16:54.544Z",
  "credentialAttributes": [
    {
      "mime-type": "text/plain",
      "name": "Member Status",
      "value": "Active"
    },
    {
      "mime-type": "text/plain",
      "name": "Given Name",
      "value": "Joyce"
    },
    {
      "mime-type": "text/plain",
      "name": "PPID",
      "value": "MC12349"
    },
    {
      "mime-type": "text/plain",
      "name": "Member Status Code",
      "value": "1"
    },
    {
      "mime-type": "text/plain",
      "name": "Surname",
      "value": "Lee-Martinez"
    }
  ]
}
`

describe('JSONDetails Screen', () => {
  afterEach(() => {
    cleanup()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('JSONDetails Screen render', () => {
    test('Error thrown when route has no params', async () => {
      // suppress console error in test output
      const originalError = console.error // eslint-disable-line no-console
      console.error = jest.fn() // eslint-disable-line no-console
      try {
        render(
          <BasicAppContext>
            <JSONDetails navigation={useNavigation()} route={{} as any} />
          </BasicAppContext>
        )
        // an error should be thrown on render
        expect(true).toBe(false)
      } catch (e) {
        expect(e).toEqual(new Error('JSONDetails route params were not set properly'))
      }
      // restore console error
      console.error = originalError // eslint-disable-line no-console
    })

    test('render matches snapshot', async () => {
      const tree = render(
        <BasicAppContext>
          <JSONDetails navigation={useNavigation()} route={{ params: { jsonBlob: jsonBlob } } as any} />
        </BasicAppContext>
      )
      expect(tree).toMatchSnapshot()
    })
  })

  describe('JSONDetails Screen functionality', () => {
    test('Share button triggers share function', async () => {
      const tree = render(
        <BasicAppContext>
          <JSONDetails navigation={useNavigation()} route={{ params: { jsonBlob: jsonBlob } } as any} />
        </BasicAppContext>
      )
      const shareButton = tree.getByTestId(testIdWithKey('Share'))
      expect(shareButton).toBeDefined()
      act(() => {
        fireEvent.press(shareButton)
      })
      expect(Share.share).toHaveBeenCalled()
    })

    test('Copy button tiggers copy function', async () => {
      const tree = render(
        <BasicAppContext>
          <JSONDetails navigation={useNavigation()} route={{ params: { jsonBlob: jsonBlob } } as any} />
        </BasicAppContext>
      )
      const copyButton = tree.getByTestId(testIdWithKey('CopyToClipboard'))
      expect(copyButton).toBeDefined()
      await act(async () => {
        fireEvent.press(copyButton)
      })
      expect(Clipboard.setString).toHaveBeenCalled()
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: expect.stringContaining('JSONDetails.CopiedSuccess'),
          type: ToastType.Success,
        })
      )
    })

    test('Error thrown when copy fails', async () => {
      jest.spyOn(Clipboard, 'setString').mockImplementation(() => {
        throw new Error()
      })
      const tree = render(
        <BasicAppContext>
          <JSONDetails navigation={useNavigation()} route={{ params: { jsonBlob: jsonBlob } } as any} />
        </BasicAppContext>
      )
      const copyButton = tree.getByTestId(testIdWithKey('CopyToClipboard'))
      expect(copyButton).toBeDefined()
      act(() => {
        fireEvent.press(copyButton)
      })
      expect(Clipboard.setString).toThrow()
      // the toast should have been called showing error
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text1: expect.stringContaining('JSONDetails.CopiedError: Error'),
          type: ToastType.Error,
        })
      )
    })
  })
})
