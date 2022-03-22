import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { Environment } from '/opt/nodejs/constants';
import { GetPresignedUrlResponse } from '../../../../website/src/models/GetPresignedUrlResponse';

AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({ signatureVersion: 'v4' });
const URL_EXPIRATION_SECONDS = 300;
const bucketName = process.env.S3_BUCKET_NAME;
const env = process.env.ENVIRONMENT;
if (!bucketName) {
    throw Error(`S3 bucket name not set`);
}

export async function getPresignedUrlHandler(event: APIGatewayProxyEventV2) {
    try {
        const randomID = Math.round(Math.random() * 10000000000);
        const key = `${randomID}.jpeg`;

        const action = 'putObject'; //JSON.parse(event.body)['action'];

        const uploadURL = await s3.getSignedUrl(action, {
            Bucket: bucketName,
            Key: key,
            Expires: URL_EXPIRATION_SECONDS,
            ContentType: 'image/jpeg',
        });

        const responseBody: GetPresignedUrlResponse = {
            uploadURL: uploadURL,
            imageUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        };

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': 'application/json',
                'Access-Control-Allow-Origin':
                    env === Environment.DEV
                        ? 'http://localhost:3000'
                        : 'https://smartmenu.erayus.com',
                'Access-Control-Allow-Methods': 'OPTIONS, GET',
            },
            body: JSON.stringify(responseBody),
        };
    } catch (error) {
        console.error({ error });
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify((error as Error).message),
        };
    }
}
