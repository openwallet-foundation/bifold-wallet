import { Container, TokenMapping } from '@hyperledger/aries-bifold-core'
import { DependencyContainer } from 'tsyringe'

export class AppContainer implements Container {
  private _container: DependencyContainer

  public constructor(bifoldContainer: Container) {
    this._container = bifoldContainer.container.createChildContainer()
  }

  public get container(): DependencyContainer {
    return this._container
  }

  public init(): Container {
    // eslint-disable-next-line no-console
    console.log(`Initializing App container`)
    // Here you can register any component to override components in core package
    // Example: Replacing button in core with custom button
    // this.container.registerInstance(TOKENS.COMP_BUTTON, Button)
    return this
  }

  public resolve<K extends keyof TokenMapping>(token: K): TokenMapping[K] {
    return this.container.resolve(token) as TokenMapping[K]
  }

  public resolveSome = <K extends keyof TokenMapping>(tokens: K[]): TokenMapping[K][] => {
    return tokens.map((token) => this.resolve(token))
  }
}
