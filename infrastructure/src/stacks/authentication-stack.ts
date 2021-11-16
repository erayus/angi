import * as cdk from "@aws-cdk/core";
import * as cognito from "@aws-cdk/aws-cognito";
import { ConfigProvider } from "../utils/config-provider";
import { NameGenerator } from "../utils/name-generator";

export class AuthenticationStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
    super(scope, id, props);
    const appName = ConfigProvider.Context(scope).AppName;
    const isDevelopment = ConfigProvider.Context(scope).IsDevelopment;

    // 👇 User Pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: NameGenerator.generateConstructName(scope, "user-pool"),
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.LINK
      },
      standardAttributes: {
        givenName: {
          required: false, //TODO
          mutable: true,
        },
        familyName: {
          required: false, //TODO
          mutable: true,
        },
      },
      customAttributes: {
        country: new cognito.StringAttribute({ mutable: true }),
        city: new cognito.StringAttribute({ mutable: true }),
        isAdmin: new cognito.StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 6,
        requireLowercase: false, //TODO: !isDevelopment
        requireDigits: false, //TODO: !isDevelopment
        requireUppercase: false,
        requireSymbols: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      removalPolicy: isDevelopment
        ? cdk.RemovalPolicy.DESTROY
        : cdk.RemovalPolicy.RETAIN,
    });

    // TODO: 👇 OPTIONALLY update Email sender for Cognito Emails
    // const cfnUserPool = userPool.node.defaultChild as cognito.CfnUserPool;
    // cfnUserPool.emailConfiguration = {
    //   emailSendingAccount: "DEVELOPER",
    //   replyToEmailAddress: "YOUR_EMAIL@example.com",
    //   sourceArn: `arn:aws:ses:YOUR_COGNITO_SES_REGION:${
    //     cdk.Stack.of(this).account
    //   }:identity/YOUR_EMAIL@example.com`,
    // };

    // 👇 User Pool Client attributes
    const standardCognitoAttributes = {
      givenName: true,
      familyName: true,
      email: true,
      emailVerified: true,
      address: true,
      birthdate: true,
      gender: true,
      locale: true,
      middleName: true,
      fullname: true,
      nickname: true,
      phoneNumber: true,
      phoneNumberVerified: true,
      profilePicture: true,
      preferredUsername: true,
      profilePage: true,
      timezone: true,
      lastUpdateTime: true,
      website: true,
    };

    const clientReadAttributes = new cognito.ClientAttributes()
      .withStandardAttributes(standardCognitoAttributes)
      .withCustomAttributes(...["country", "city", "isAdmin"]);

    const clientWriteAttributes = new cognito.ClientAttributes()
      .withStandardAttributes({
        ...standardCognitoAttributes,
        emailVerified: false,
        phoneNumberVerified: false,
      })
      .withCustomAttributes(...["country", "city"]);

    const userPoolClient = new cognito.UserPoolClient(this, "Userpool-Client", {
      userPool,
      authFlows: {
        adminUserPassword: true,
        custom: true,
        userSrp: true,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO, //TODO: Facebook and Google?
      ],
      readAttributes: clientReadAttributes,
      writeAttributes: clientWriteAttributes,
    });

    const userPoolDomain = new cognito.UserPoolDomain(this, "Userpool-Domain", {
      userPool,
      cognitoDomain: {
         domainPrefix: NameGenerator.generateConstructName(this, 'userpool-erayus')
      }
    })

    // 👇 Outputs
    new cdk.CfnOutput(this, "Userpool-Id-Output", {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, "Userpool-ClientId-Output", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "Userpool-Domain-Output", {
      value: userPoolDomain.domainName,
    });
  }
}
