import { CredentialRecord, ConnectionRecord, CredentialState } from '@aries-framework/core'
import { useAgent, useCredentialById, useConnectionById } from '@aries-framework/react-hooks'
import { useNavigation } from '@react-navigation/core'
import { act, fireEvent, render, waitFor } from '@testing-library/react-native'
import fs from 'fs'
import path from 'path'
import React from 'react'
import { Alert } from 'react-native'

import CredentialOffer from '../../App/screens/CredentialOffer'

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper')

const props = { params: { credentialId: '123' } }

const connectionPath = path.join(__dirname, '../fixtures/faber-connection.json')
const connection = JSON.parse(fs.readFileSync(connectionPath, 'utf8'))

const credentialPath = path.join(__dirname, '../fixtures/degree-credential.json')
const credential = JSON.parse(fs.readFileSync(credentialPath, 'utf8'))

const connectionRecord = new ConnectionRecord(connection)
const credentialRecord = new CredentialRecord(credential)
// TODO:(jl) Make a fn to revive JSON dates properly and pass to `parse`
credentialRecord.createdAt = new Date(credentialRecord.createdAt)

// @ts-ignore
useConnectionById.mockReturnValue(connectionRecord)

describe('displays a credential offer screen', () => {
  test('renders correctly', () => {
    // @ts-ignore
    useCredentialById.mockReturnValue(credentialRecord)
    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    expect(tree).toMatchSnapshot()
  })

  test('shows declined conformation alert', async () => {
    // @ts-ignore
    useCredentialById.mockReturnValue(credentialRecord)

    const spyAlert = jest.spyOn(Alert, 'alert')
    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)
    const declineBtn = await tree.findByText('Global.Decline')

    fireEvent(declineBtn, 'press')

    expect(spyAlert).toHaveBeenCalledTimes(1)

    await waitFor(async () => {
      // @ts-ignore
      await spyAlert.mock.calls[0][2][1].onPress()
    })

    expect(tree).toMatchSnapshot()
  })

  test('shows credential delivery modal', async () => {
    // @ts-ignore
    useCredentialById.mockReturnValue(credentialRecord)
    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    const acceptBtn = await tree.findByText('Global.Accept')
    fireEvent(acceptBtn, 'press')

    const onTheWayModal = tree.getByTestId('CredentialOffer.CredentialOnTheWay')
    const declinedModal = tree.queryByTestId('CredentialOffer.CredentialDeclined')
    const addedModal = tree.queryByTestId('CredentialOffer.CredentialAddedToYourWallet')

    expect(onTheWayModal).not.toBeNull()
    expect(onTheWayModal.props.visible).toBeTruthy()
    expect(declinedModal).toBeNull()
    expect(addedModal).toBeNull()
  })

  test('handle declined credential', async () => {
    const myCredential = new CredentialRecord(credential)
    myCredential.createdAt = new Date(credentialRecord.createdAt)
    myCredential.state = CredentialState.Declined
    // @ts-ignore
    useCredentialById.mockReturnValue(myCredential)

    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    const onTheWayModal = tree.queryByTestId('CredentialOffer.CredentialOnTheWay')
    const declinedModal = tree.getByTestId('CredentialOffer.CredentialDeclined')
    const addedModal = tree.queryByTestId('CredentialOffer.CredentialAddedToYourWallet')

    expect(onTheWayModal).toBeNull()
    expect(declinedModal).not.toBeNull()
    expect(declinedModal.props.visible).toBeTruthy()
    expect(addedModal).toBeNull()
  })

  test('handle received credential', async () => {
    const myCredential = new CredentialRecord(credential)
    myCredential.createdAt = new Date(credentialRecord.createdAt)
    myCredential.state = CredentialState.CredentialReceived
    // @ts-ignore
    useCredentialById.mockReturnValue(myCredential)

    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    const onTheWayModal = tree.queryByTestId('CredentialOffer.CredentialOnTheWay')
    const declinedModal = tree.queryByTestId('CredentialOffer.CredentialDeclined')
    const addedModal = tree.getByTestId('CredentialOffer.CredentialAddedToYourWallet')

    expect(onTheWayModal).toBeNull()
    expect(declinedModal).toBeNull()
    expect(addedModal).not.toBeNull()
    expect(addedModal.props.visible).toBeTruthy()
  })

  test('handle done credential', async () => {
    const myCredential = new CredentialRecord(credential)
    myCredential.createdAt = new Date(credentialRecord.createdAt)
    myCredential.state = CredentialState.Done
    // @ts-ignore
    useCredentialById.mockReturnValue(myCredential)

    const tree = render(<CredentialOffer route={props as any} navigation={useNavigation()} />)

    const onTheWayModal = tree.queryByTestId('CredentialOffer.CredentialOnTheWay')
    const declinedModal = tree.queryByTestId('CredentialOffer.CredentialDeclined')
    const addedModal = tree.getByTestId('CredentialOffer.CredentialAddedToYourWallet')

    expect(onTheWayModal).toBeNull()
    expect(declinedModal).toBeNull()
    expect(addedModal).not.toBeNull()
    expect(addedModal.props.visible).toBeTruthy()
  })
})
