import { ApiPath } from './models/api-path';
import { CognitoUserPool, ICognitoUserPoolData } from 'amazon-cognito-identity-js';

const apiBaseUrl = {
    development: "https://xog1qed10d.execute-api.ap-southeast-2.amazonaws.com/prod/",
    production: "production_api",
}

const getApiUrlForPath = (path: ApiPath) => {
    switch(process.env.NODE_ENV) {
        case "development":
            return apiBaseUrl.development + path
        case "production":
            return apiBaseUrl.production + path
        default:
            return null;
    }
}

const getApiBaseUrl = () => {
    switch(process.env.NODE_ENV) {
        case "development":
            return apiBaseUrl.development;
        case "production":
            return apiBaseUrl.production
        default:
            return apiBaseUrl.development
    }
}


const getUserPoolConfig = () : ICognitoUserPoolData => {
    switch(process.env.NODE_ENV) {
        case "development":
            return {
                UserPoolId: "ap-southeast-2_GDSqvvaqC",
                ClientId: "2jvusv1gnlevn0dh0sd2pqb976"
            }
        case "production":
            return {
                UserPoolId: "",
                ClientId: ""
            }
        default:
            return {
                UserPoolId: "",
                ClientId: ""
            }
        }
}
const config = {
    getApiUrlForPath,
    getApiBaseUrl,
    getUserPoolConfig,
}

export default config;
