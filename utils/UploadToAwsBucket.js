const fs = require("fs");
const { S3Client } = require("@aws-sdk/client-s3");
const { PutObjectCommand } = require("@aws-sdk/client-s3");

const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_KEY = process.env.AWS_SECRET_KEY;
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const AWS_BUCKET_FILE_PATH = process.env.AWS_BUCKET_FILE_PATH;

console.log(AWS_ACCESS_KEY)
const s3_client = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_KEY,
  },
  region: process.env.AWS_REGION,
});

async function UploadToAwsBucket(fileName) {
  try {
    console.log("In UploadAWS Function")
    console.log(fileName);
    console.log(path.join(__dirname, '..', 'Uploads', fileName))
    const fileContent = fs.readFileSync(path.join(__dirname, '..', 'Uploads', fileName));

    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
    };

    const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
    const contentType = mimeTypes[fileExtension.toLowerCase()] || 'application/octet-stream';
    const command = new PutObjectCommand({
      Bucket: AWS_BUCKET_NAME,
      Key: `${AWS_BUCKET_FILE_PATH}/${fileName}`,
      Body: fileContent,
      ACL: "public-read",
      ContentType: contentType
    });

    await s3_client.send(command);
    fs.unlink((path.join(__dirname, '..', 'Uploads', fileName)), (err) => { console.log(err) });

    return `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${AWS_BUCKET_FILE_PATH}/${fileName}`;

  } catch (error) {
    console.error(error);
    return false;
  }
}

module.exports = UploadToAwsBucket;
