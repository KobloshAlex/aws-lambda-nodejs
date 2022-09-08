import { S3 } from "aws-sdk";

const s3 = new S3();

export async function uploadPictureToS3(key, body) {
  return await s3
    .upload({
      Bucket: process.env.AUCTION_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentEncoding: "base64",
      ContentType: "image/jpeg",
    })
    .promise();
}
