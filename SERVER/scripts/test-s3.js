import * as dotenv from 'dotenv'
import { uploadToS3, getPublicFileBaseUrl, isS3Enabled } from '../Helpers/s3Client.js'
import { HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'

dotenv.config()

async function main() {
    console.log('S3 enabled:', isS3Enabled())
    console.log('Bucket:', process.env.AWS_S3_BUCKET)
    console.log('Region:', process.env.AWS_REGION)

    if (!isS3Enabled()) {
        console.error('FAIL: AWS keys or bucket missing in .env')
        process.exit(1)
    }

    const key = `test/s3-health-check-${Date.now()}.txt`
    const body = `Indianet S3 test OK at ${new Date().toISOString()}`

    try {
        await uploadToS3({ key, body, contentType: 'text/plain' })
        console.log('UPLOAD OK:', key)

        const client = new S3Client({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        })
        await client.send(new HeadObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        }))
        console.log('HEAD OK: object exists in bucket')

        const publicUrl = `${getPublicFileBaseUrl()}/${key}`
        console.log('Public URL:', publicUrl)

        const res = await fetch(publicUrl)
        if (res.ok) {
            const text = await res.text()
            console.log('PUBLIC READ OK:', text)
        } else {
            console.warn('PUBLIC READ FAILED:', res.status, res.statusText)
            console.warn('Upload works but bucket may need public read policy on', process.env.AWS_S3_BUCKET)
        }
    } catch (err) {
        console.error('FAIL:', err.name, err.message)
        if (err.name === 'NoSuchBucket') {
            console.error('Create bucket', process.env.AWS_S3_BUCKET, 'in AWS S3 console (ap-south-1)')
        }
        process.exit(1)
    }
}

main()
