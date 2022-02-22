import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';

export type AuthUser = {
    email: string;
    sub: string;
    email_verified: boolean;
    session: CognitoUserSession;
    current: CognitoUser;
};
