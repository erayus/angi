const importFoodApi = {
    development: "https://ju1imclj69.execute-api.ap-southeast-2.amazonaws.com/prod/import_food",
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
