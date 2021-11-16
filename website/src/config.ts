import { ApiPath } from './models/api-path';
import { ICognitoUserPoolData } from 'amazon-cognito-identity-js';

const apiBaseUrl = {
    development: "https://xog1qed10d.execute-api.ap-southeast-2.amazonaws.com/prod/",
    production: "https://e233e9k6f2.execute-api.ap-southeast-2.amazonaws.com/prod/",
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
                UserPoolId: "ap-southeast-2_9moqkmThg",
                ClientId: "2qjvvqakthonevf61lgfdo4ed6"
            }
        case "production":
            return {
                UserPoolId: "ap-southeast-2_UHMWaKRMz",
                ClientId: "4a514ha5hnh3nbkl1f1mpmtmvm"
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
