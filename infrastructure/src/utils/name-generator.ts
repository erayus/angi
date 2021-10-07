import { IConstruct } from "@aws-cdk/core";
import { ConfigProvider } from "./config-provider";

export class NameGenerator {
  public static generateConstructName(
    scope: IConstruct,
    constructName: string,
    isDev?: boolean,
    separator?: string
  ): string {
    if (constructName === undefined || constructName.length < 1) {
      throw new Error("constructName must be a non-empty string");
    }

    separator = separator || "-";
    isDev = isDev || false;
    const appNamePrefix = ConfigProvider.Context(scope).AppName;

    if (isDev) {
      return [appNamePrefix, constructName, "dev"].join(separator);
    } else {
      return [appNamePrefix, constructName].join(separator);
    }
  }
}
