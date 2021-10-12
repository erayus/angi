import { ApiPath } from './models/api-path';

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
            return apiBaseUrl.development
        case "production":
            return apiBaseUrl.production
        default:
            return apiBaseUrl.development
    }
}
const config = {
    getApiUrlForPath,
    getApiBaseUrl
}

export default config;
