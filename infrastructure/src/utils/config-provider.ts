import { IConstruct } from "@aws-cdk/core";
import { ContextConfig } from "../model/context-config";

export class ConfigProvider {
    private readonly scope: IConstruct;
    
    public static Context(scope: IConstruct): ContextConfig {
        return new ContextConfig(scope)
    }
}