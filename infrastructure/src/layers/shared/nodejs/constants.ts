export enum Environment {
    DEV = 'development',
    PROD = 'production',
}

export const GenerateResponse = (
    httpCode: number,
    env: string,
    allowMethod: 'POST' | 'GET',
    body: string
) => {
    return {
        statusCode: httpCode,
        headers: {
            'Access-Control-Allow-Origin':
                env === Environment.DEV
                    ? 'http://localhost:3000'
                    : 'https://smartmenu.erayus.com', // Required for CORS support to work,
            'Access-Control-Allow-Methods': `OPTIONS, ${allowMethod}`,
            'Access-Control-Allow-Headers': '*',
        },
        body: body,
    };
};
