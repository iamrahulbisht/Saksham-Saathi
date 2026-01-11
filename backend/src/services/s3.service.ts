import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});

export async function uploadAudioToS3(audioBase64: string, studentId: string, gameNumber: number): Promise<string> {
    const Bucket = process.env.AWS_S3_BUCKET;
    const Region = process.env.AWS_REGION;

    if (!Bucket || !Region) {
        throw new Error("AWS S3 Configuration missing");
    }

    // Convert Base64 to Buffer
    // Remove data:audio/webm;base64, prefix
    const base64Data = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const key = `assessments/${studentId}/${Date.now()}_game${gameNumber}.webm`;

    await s3.putObject({
        Bucket: Bucket,
        Key: key,
        Body: buffer,
        ContentType: 'audio/webm',
        ACL: 'private' // or 'public-read' based on policy
    }).promise();

    // Return generated URL
    return `https://${Bucket}.s3.${Region}.amazonaws.com/${key}`;
}

export async function uploadImageToS3(imageBase64: string, key: string): Promise<string> {
    const Bucket = process.env.AWS_S3_BUCKET;
    const Region = process.env.AWS_REGION;

    if (!Bucket || !Region) {
        throw new Error("AWS S3 Configuration missing");
    }

    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    await s3.putObject({
        Bucket: Bucket,
        Key: key,
        Body: buffer,
        ContentType: 'image/png',
        ACL: 'private'
    }).promise();

    return `https://${Bucket}.s3.${Region}.amazonaws.com/${key}`;
}
