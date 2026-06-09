import fs from 'fs'
import multer from 'multer'
import { isS3Enabled } from './s3Client.js'
import { S3MulterStorage } from './s3MulterStorage.js'

function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
}

export function createUploadStorage({ diskDestination, diskFilename, s3KeyBuilder }) {
    if (isS3Enabled()) {
        return new S3MulterStorage(s3KeyBuilder)
    }

    return multer.diskStorage({
        destination(req, file, cb) {
            const dir = diskDestination(req, file)
            ensureDir(dir)
            cb(null, dir)
        },
        filename(req, file, cb) {
            cb(null, diskFilename(req, file))
        },
    })
}
