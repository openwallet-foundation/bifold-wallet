import { useNavigation } from '@react-navigation/native'
import { render } from '@testing-library/react-native'
import React from 'react'
import { container } from 'tsyringe'

import { StoreContext } from '../../App'
import Settings from '../../App/screens/Settings'
import { testIdWithKey } from '../../App/utils/testable'
import { testDefaultState } from '../contexts/store'
import { BasicAppContext } from '../helpers/app'
import { CustomBasicAppContext } from '../helpers/app'
import { TOKENS } from '../../App/container-api'
import { MainContainer } from '../../App/container-impl'

describe('Settings Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('Renders correctly', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
        walletName: 'My Wallet',
      },
    }

    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <BasicAppContext>
          <Settings navigation={useNavigation()} route={{} as any} />
        </BasicAppContext>
      </StoreContext.Provider>
    )
    expect(tree).toMatchSnapshot()
  })

  test('Renders correctly with wallet naming', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
        useConnectionInviterCapability: true,
        walletName: 'Wallet123',
      },
    }

    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <BasicAppContext>
          <Settings navigation={useNavigation()} route={{} as any} />
        </BasicAppContext>
      </StoreContext.Provider>
    )

    const walletName = tree.getByText('Wallet123')
    const editButton = tree.getByTestId(testIdWithKey('EditWalletName'))

    expect(editButton).not.toBeNull()
    expect(walletName).not.toBeNull()
  })

  test('If developer mode is enabled, developer mode button is shown', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
        walletName: 'My Wallet',
      },
    }
    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <BasicAppContext>
          <Settings navigation={useNavigation()} route={{} as any} />
        </BasicAppContext>
      </StoreContext.Provider>
    )

    const developerModeButton = tree.getByTestId(testIdWithKey('DeveloperOptions'))
    expect(developerModeButton).not.toBeNull()
  })

  test('If mobile verifier is enabled, verifier options are shown', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        useVerifierCapability: true,
        walletName: 'My Wallet',
      },
    }
    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <BasicAppContext>
          <Settings navigation={useNavigation()} route={{} as any} />
        </BasicAppContext>
      </StoreContext.Provider>
    )
    const proofButton = tree.getByTestId(testIdWithKey('ProofRequests'))
    expect(proofButton).not.toBeNull()
  })

  test('If disableContactsInSettings is true, the Contacts section is not shown', async () => {
    const customState = {
      ...testDefaultState,
      preferences: {
        ...testDefaultState.preferences,
        developerModeEnabled: true,
        walletName: 'My Wallet',
      },
    }

    const context = new MainContainer(container.createChildContainer()).init()
    const config = context.resolve(TOKENS.CONFIG)
    context.container.registerInstance(TOKENS.CONFIG, { ...config, disableContactsInSettings: true})

    const tree = render(
      <StoreContext.Provider
        value={[
          customState,
          () => {
            return
          },
        ]}
      >
        <CustomBasicAppContext container={context}>
          <Settings navigation={useNavigation()} route={{} as any} />
        </CustomBasicAppContext>
      </StoreContext.Provider>
    )
    const contactsSection = tree.queryByTestId(testIdWithKey('Contacts'))
    expect(contactsSection).toBeNull()
  })
})
