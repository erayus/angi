import { CognitoAccessToken, CognitoRefreshToken, CognitoUser } from "amazon-cognito-identity-js";

export type User = {
  email: string,
  sub: string,
  accessToken: CognitoAccessToken,
  refreshToken: CognitoRefreshToken,
  email_verified: boolean,
  current: CognitoUser
};