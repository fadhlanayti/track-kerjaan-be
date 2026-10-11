import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const ext = filename.split('.').pop()
  const key = `uploads/${crypto.randomUUID()}.${ext}`

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: file,
      ContentType: contentType,
    })
  )

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

export async function deleteFromR2(url: string): Promise<boolean> {
  try {
    const publicUrl = process.env.R2_PUBLIC_URL!
    if (!url.startsWith(publicUrl)) return false

    const key = url.replace(`${publicUrl}/`, '')
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
      })
    )
    return true
  } catch (error) {
    console.error('Delete R2 failed:', error)
    return false
  }
}
