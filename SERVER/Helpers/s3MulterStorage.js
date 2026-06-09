import path from 'path'
import { uploadToS3 } from './s3Client.js'

/**
 * Multer storage engine that uploads buffers to S3.
 * `keyBuilder(req, file)` must return the S3 object key (e.g. product/abc/file.jpg).
 */
export class S3MulterStorage {
    constructor(keyBuilder) {
        this.keyBuilder = keyBuilder
    }

    _handleFile(req, file, cb) {
        const chunks = []
        file.stream.on('data', (chunk) => chunks.push(chunk))
        file.stream.on('error', (err) => cb(err))
        file.stream.on('end', async () => {
            try {
                const buffer = Buffer.concat(chunks)
                const built = this.keyBuilder(req, file)
                const key = typeof built === 'string' ? built : built.key
                const filename = typeof built === 'string'
                    ? path.basename(built)
                    : (built.filename || path.basename(key))

                await uploadToS3({
                    key,
                    body: buffer,
                    contentType: file.mimetype,
                })

                cb(null, {
                    destination: '',
                    filename,
                    path: `/${String(key).replace(/^\//, '')}`,
                    size: buffer.length,
                })
            } catch (err) {
                cb(err)
            }
        })
    }

    _removeFile(req, file, cb) {
        cb(null)
    }
}
