/**
 * Upload presign and media redirect (MVP3.6 – R2 media in chat).
 */

const crypto = require('crypto');
const { readUsers, writeUsers } = require('../db');
const { getAuthUser } = require('../auth');
const { getPresignedPutUrl, getPresignedGetUrl, getObjectSize, isR2Configured } = require('../r2');

const STORAGE_LIMIT_BYTES = 100 * 1024 * 1024; // 100 MB
const MAX_FILE_BYTES = 5 * 1024 * 1024;         // 5 MB per file

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function ensureProfile(user) {
  if (!user.profile) user.profile = {};
  if (typeof user.profile.storageUsed !== 'number') user.profile.storageUsed = 0;
  return user.profile;
}

/**
 * POST /api/upload/presign – get presigned PUT URL for direct upload.
 * Body: { size: number, contentType: string }
 * Returns: { uploadUrl, key } or 413 if over limit.
 */
async function handlePresign(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = getAuthUser(req);
  if (!user?.id) return res.status(401).json({ error: 'Authentication required.' });

  if (!isR2Configured()) {
    return res.status(503).json({ error: 'Upload service is not configured.', message: 'R2 credentials missing.' });
  }

  const size = Number(req.body?.size);
  const contentType = String(req.body?.contentType || '').trim() || 'application/octet-stream';

  if (!Number.isFinite(size) || size <= 0) {
    return res.status(400).json({ error: 'Valid size (bytes) is required.' });
  }
  if (size > MAX_FILE_BYTES) {
    return res.status(413).json({ error: 'File too large.', message: `Maximum ${MAX_FILE_BYTES / 1024 / 1024} MB per file.` });
  }

  try {
    const users = await readUsers();
    const authUser = users.find((u) => u.id === user.id);
    if (!authUser) return res.status(404).json({ error: 'User not found.' });

    const profile = ensureProfile(authUser);
    const used = profile.storageUsed || 0;
    if (used + size > STORAGE_LIMIT_BYTES) {
      return res.status(413).json({
        error: 'Storage limit exceeded.',
        message: `You have used ${Math.round(used / 1024 / 1024)} MB of ${STORAGE_LIMIT_BYTES / 1024 / 1024} MB.`,
        usedBytes: used,
        limitBytes: STORAGE_LIMIT_BYTES,
      });
    }

    const ext = contentType === 'image/png' ? 'png' : contentType === 'image/gif' ? 'gif' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const key = `uploads/${authUser.id}/${crypto.randomUUID()}.${ext}`;

    const result = await getPresignedPutUrl(key, contentType);
    if (!result) return res.status(503).json({ error: 'Failed to generate upload URL.' });

    return res.status(200).json({
      uploadUrl: result.uploadUrl,
      key: result.key,
      expiresIn: 900,
    });
  } catch (error) {
    console.error('Presign error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

/**
 * GET /api/media/:key – redirect to presigned GET URL for the object.
 * Key can be path: uploads/userId/uuid.jpg (encoded in URL).
 */
async function handleMediaRedirect(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const pathname = (req.url || '').split('?')[0];
  const prefix = '/api/media/';
  if (!pathname.startsWith(prefix)) return res.status(400).json({ error: 'Invalid path.' });
  let key = pathname.slice(prefix.length).replace(/^\/+/, '');
  try {
    key = decodeURIComponent(key);
  } catch {
    return res.status(400).json({ error: 'Invalid key.' });
  }
  if (!key || !key.startsWith('uploads/')) {
    return res.status(400).json({ error: 'Invalid key.' });
  }

  if (!isR2Configured()) {
    return res.status(503).json({ error: 'Media service is not configured.' });
  }

  try {
    const url = await getPresignedGetUrl(key);
    if (!url) return res.status(503).json({ error: 'Failed to generate media URL.' });
    res.setHeader('Location', url);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    return res.status(302).redirect(url);
  } catch (error) {
    console.error('Media redirect error:', error);
    return res.status(500).json({ error: 'Operation failed', message: error.message });
  }
}

module.exports = {
  handlePresign,
  handleMediaRedirect,
  STORAGE_LIMIT_BYTES,
  getObjectSize,
  ensureProfile,
};
