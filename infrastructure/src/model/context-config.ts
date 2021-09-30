import { IConstruct } from '@aws-cdk/core';

export class ContextConfig {
  private readonly scope: IConstruct;
  /**
   * Gets the context configuration.
   * @param scope The aws construct, likely the cdk Stack or App this method is called from.
   */
  constructor(scope: IConstruct) {
    this.scope = scope;
  }


  /**
   * Gets the flag indicating that the project is being deployed in developer mode.
   * This enables less-secure but easily debuggable config.
   */
  public get IsProduction(): boolean {
    return this.scope.node.tryGetContext("environment") === "production";;
  }

  /**
   * Gets the project name.
   */
  public get AppName(): string {
    return this.scope.node.tryGetContext('appName');
  }
}
