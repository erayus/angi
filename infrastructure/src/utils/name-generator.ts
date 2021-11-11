import { IConstruct } from "@aws-cdk/core";
import { ConfigProvider } from "./config-provider";
import { ContextConfig } from '../models/context-config';

export class NameGenerator {
  public static generateConstructName(
    scope: IConstruct,
    constructName: string,
    separator?: string
  ): string {
    if (constructName === undefined || constructName.length < 1) {
      throw new Error("constructName must be a non-empty string");
    }

    separator = separator || "-";
    const isDev = ConfigProvider.Context(scope).IsDevelopment;
    const appNamePrefix = ConfigProvider.Context(scope).AppName;

    if (isDev) {
      return [appNamePrefix, constructName, "dev"].join(separator);
    } else {
      return [appNamePrefix, constructName].join(separator);
    }
  }
}
