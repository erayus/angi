import {CognitoUser, CognitoUserSession } from "amazon-cognito-identity-js";

export type User = {
  email: string,
  sub: string,
  email_verified: boolean,
  session: CognitoUserSession,
  current: CognitoUser
};