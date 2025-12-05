import multer, { type Multer, type FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import s3Client from './s3Client.js';
import path from 'path';
import type { Request } from 'express';

const BUCKET_NAME: string | undefined = process.env.S3_BUCKET_NAME;
const MAX_FILE_SIZE: number = 1024 * 1024 * 10;

if (!BUCKET_NAME) {
    throw new Error("S3_BUCKET_NAME environment variable is not set.");
}

const s3Storage = multerS3({
    s3: s3Client,
    bucket: BUCKET_NAME,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    
    key: (req: Request, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
        const uniqueSuffix: string = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension: string = path.extname(file.originalname);
        
        const key: string = `uploads/images/${uniqueSuffix}${fileExtension}`;
        cb(null, key);
    }
});

const upload: Multer = multer({
    storage: s3Storage,
    limits: { 
        fileSize: MAX_FILE_SIZE
    },
    
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type, only JPEG and PNG are allowed!'));
        }
    }
});

export default upload;