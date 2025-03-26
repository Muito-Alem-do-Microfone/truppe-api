import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const s3 = new aws.S3({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const uploadToS3 = multer({
  storage: multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    acl: "public-read",
    key: (req, file, cb) => {
      const filename = `${uuidv4()}-${file.originalname}`;
      cb(null, filename);
    },
  }),
});
