import { S3Client } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';

dotenv.config();

const AWS_REGION = process.env.AWS_REGION || "us-east-1";

const s3Client = new S3Client({
    region: AWS_REGION
    // The AWS SDK automatically looks for AWS_ACCESS_KEY_ID and 
    // AWS_SECRET_ACCESS_KEY in the environment variables (process.env)
});

export default s3Client;