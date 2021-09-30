const importFoodApi = {
    development: "http://localhost:4566/restapis/1ziss5z0fs/prod/_user_request_/import-food",
    production: "production_api",
}

const getImportFoodApi = () => {
    switch(process.env.NODE_ENV) {
        case "development":
            return importFoodApi.development
        case "production":
            return importFoodApi.production
        default:
            return null;
    }
}
const config = {
    IMPORT_FOOD_API: getImportFoodApi(),
}

export default config;
