import { APIGatewayProxyEventV2 } from 'aws-lambda';
import * as AWS from 'aws-sdk';

AWS.config.update({ region: process.env.AWS_REGION });
const s3 = new AWS.S3({ signatureVersion: 'v4' });
const URL_EXPIRATION_SECONDS = 300;
const bucketName = process.env.S3_BUCKET_NAME;
if (!bucketName) {
    throw Error(`S3 bucket name not set`);
}

export async function getPresignedUrlHandler(event: APIGatewayProxyEventV2) {
    try {
        const randomID = Math.random() * 10000000;
        const key = `${randomID}.jpg`;
        // if (!event.body) {
        //     throw Error(`Event must have a body.`);
        // }

        // const key = JSON.parse(event.body)['object_key'];
        // if (!key) {
        //     throw Error('S3 object key missing');
        // }

        const action = 'putObject'; //JSON.parse(event.body)['action'];
        // if (
        //     action !== 'putObject'
        //     // && action !== 'getObject' //TODO: consider making reading img private
        // ) {
        //     throw Error('Action not allowed');
        // }
        const uploadURL = await s3.getSignedUrl(action, {
            Bucket: bucketName,
            Key: key,
            Expires: URL_EXPIRATION_SECONDS,
            ContentType: 'image/jpeg',
        });
        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uploadURL: uploadURL,
                imageUrl: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
            }),
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
