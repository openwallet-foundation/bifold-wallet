import { BifoldLogger, Container, TokenMapping, TOKENS } from '@bifold/core'
import { Platform } from 'react-native'
import { DependencyContainer } from 'tsyringe'
import axios from 'axios'

export class AppContainer implements Container {
  private _container: DependencyContainer
  private log?: BifoldLogger

  public constructor(bifoldContainer: Container, log?: BifoldLogger) {
    this._container = bifoldContainer.container.createChildContainer()
    this.log = log
  }

  public get container(): DependencyContainer {
    return this._container
  }

  public init(): Container {
    // eslint-disable-next-line no-console
    this.log?.info(`Initializing App container`)
    // Here you can register any component to override components in core package
    // Example: Replacing button in core with custom button
    // this.container.registerInstance(TOKENS.COMP_BUTTON, Button)

    //This is an example of how to customize the screen layout and use custom header for wallets who wnat to hide default navigation header
    //To hide navigation header for a specific page, use headerShown: false in the screen options like this
    /**
    this.container.registerInstance(TOKENS.OBJECT_SCREEN_CONFIG, {
      ...DefaultScreenOptionsDictionary,
      [Screens.Terms]: {
        ...DefaultScreenOptionsDictionary[Screens.Terms],
        headerShown: false,
      },
    })

    //Customizing Terms screen custom header
    this.container.registerInstance(TOKENS.OBJECT_LAYOUT_CONFIG, {
      ...DefaultScreenLayoutOptions,
      [Screens.Terms]: {
        ...DefaultScreenLayoutOptions[Screens.Terms],
        customEdges: ['bottom'],
        safeArea: true,
        Header: () => (
          <View style={{ backgroundColor: 'red', height: 129, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Custom Header</Text>
          </View>
        ),
      },
    })
    // Add custom pbkdf hashing algorithm implementation using react-native-quick-crypto
    this.container.registerInstance(TOKENS.FN_PIN_HASH_ALGORITHM, (PIN: string, salt: string) => {
      try {
        const hashedPIN = crypto.pbkdf2Sync(PIN, salt, 300000, 128, 'sha256').toString('hex')
        return hashedPIN
      } catch (error) {
        throw new Error(`Error generating hash for PIN ${String((error as Error)?.message ?? error)}`)
      }
    })
    */ 

      this.container.registerInstance(TOKENS.FN_ATTESTATION_GET_CHALLENGE, async () => {

      const response = await axios.post(
        '',
      )

      if (response.status !== 200)
        throw new Error(`Failed to register attestation: ${response.status}`)
      
      return response.data?.attestation_challenge

    })

    this.container.registerInstance(TOKENS.FN_ATTESTATION_GET_JWT, async (attestationResult: string | string[], challenge: string, keyID: string) => {

      const payload: any = {
        attestation: Array.isArray(attestationResult) ? attestationResult.join(',') : attestationResult,
        challenge,
        platform: Platform.OS,
        ...(Platform.OS === 'ios' ? { keyId: keyID } : {})
      }

      const response = await axios.post(
        '', 
        JSON.stringify(payload),
      )

      if (response.status !== 200) 
        throw new Error(`Failed to register attestation: ${response.status}`)

      return response.data
      
    })

    return this
  }

  public resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K] {
    return this._container.resolve(token)
  }
  public resolveAll<K extends keyof TokenMapping, T extends K[]>(
    tokens: [...T]
  ): { [I in keyof T]: TokenMapping[T[I]] } {
    return tokens.map((key) => this.resolve(key)!) as { [I in keyof T]: TokenMapping[T[I]] }
  }
}
