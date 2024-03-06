import { Container, TokenMapping } from '@hyperledger/aries-bifold-core'
import { DependencyContainer } from 'tsyringe'

export class AppContainer implements Container {
  private container: DependencyContainer
  public constructor(bifoldContainer: Container) {
    this.container = bifoldContainer.getContainer().createChildContainer()
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

  public getContainer(): DependencyContainer {
    return this.container
  }
}
