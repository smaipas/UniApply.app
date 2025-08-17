import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});

export async function getPresignedUrl(key: string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.UPLOADS_BUCKET!,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, cmd, { expiresIn: 300 });
}
