/**
 * Cloudflare R2 (S3-compatible) client for media uploads (MVP3.6).
 * Uses @aws-sdk/client-s3 with R2 endpoint.
 */

const { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'tripmaker-media';

function getR2Client() {
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
    return null;
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
  });
}

const PRESIGN_PUT_EXPIRES = 900;   // 15 min
const PRESIGN_GET_EXPIRES = 3600;  // 1 hour

/**
 * Generate presigned PUT URL for direct upload. Caller must then POST message with imageKey.
 * @param {string} key - Object key (e.g. uploads/userId/uuid.jpg)
 * @param {string} contentType - e.g. image/jpeg
 * @returns {Promise<{ uploadUrl: string, key: string } | null>}
 */
async function getPresignedPutUrl(key, contentType) {
  const client = getR2Client();
  if (!client) return null;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType || 'application/octet-stream',
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: PRESIGN_PUT_EXPIRES });
  return { uploadUrl, key };
}

/**
 * Generate presigned GET URL for reading an object (redirect for /api/media/:key).
 * @param {string} key - Object key
 * @returns {Promise<string | null>}
 */
async function getPresignedGetUrl(key) {
  const client = getR2Client();
  if (!client) return null;
  const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
  return getSignedUrl(client, command, { expiresIn: PRESIGN_GET_EXPIRES });
}

/**
 * Get object size (ContentLength) via HEAD. Returns null if not found or R2 not configured.
 * @param {string} key - Object key
 * @returns {Promise<number | null>}
 */
async function getObjectSize(key) {
  const client = getR2Client();
  if (!client) return null;
  try {
    const command = new HeadObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key });
    const response = await client.send(command);
    return response.ContentLength != null ? Number(response.ContentLength) : null;
  } catch {
    return null;
  }
}

function isR2Configured() {
  return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY);
}

module.exports = {
  getR2Client,
  getPresignedPutUrl,
  getPresignedGetUrl,
  getObjectSize,
  isR2Configured,
  R2_BUCKET_NAME,
};
