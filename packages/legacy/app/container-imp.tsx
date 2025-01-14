import { BifoldLogger, Container, TokenMapping } from '@hyperledger/aries-bifold-core'
import { DependencyContainer } from 'tsyringe'

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
      */
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
