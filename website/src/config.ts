import { ApiPath } from './models/api-path';
import { ICognitoUserPoolData } from 'amazon-cognito-identity-js';

const apiBaseUrl = {
    development:
        'https://sp0tkgqm1e.execute-api.ap-southeast-2.amazonaws.com/prod/',
    production:
        'https://e233e9k6f2.execute-api.ap-southeast-2.amazonaws.com/prod/',
};

const getApiUrlForPath = (path: ApiPath) => {
    switch (process.env.NODE_ENV) {
        case 'development':
            return apiBaseUrl.development + path;
        case 'production':
            return apiBaseUrl.production + path;
        default:
            return null;
    }
};

const getApiBaseUrl = () => {
    switch (process.env.NODE_ENV) {
        case 'development':
            return apiBaseUrl.development;
        case 'production':
            return apiBaseUrl.production;
        default:
            return apiBaseUrl.development;
    }
};

const getUserPoolConfig = (): ICognitoUserPoolData => {
    switch (process.env.NODE_ENV) {
        case 'development':
            return {
                UserPoolId: 'ap-southeast-2_oypK8OC8k',
                ClientId: '5653uabeot37c69jgr7j8c2ia',
            };
        case 'production':
            return {
                UserPoolId: 'ap-southeast-2_UHMWaKRMz',
                ClientId: '4a514ha5hnh3nbkl1f1mpmtmvm',
            };
        default:
            return {
                UserPoolId: '',
                ClientId: '',
            };
    }
};
const config = {
    getApiUrlForPath,
    getApiBaseUrl,
    getUserPoolConfig,
};

export default config;
