import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';

export const isCloudinaryConfigured = Boolean(
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

/**
 * Upload a base64 data URI (data:image/...;base64,xxx) or a remote URL to
 * Cloudinary and return the secure URL. Used by the admin product editor.
 */
export async function uploadImage(dataUri: string): Promise<string> {
  if (!isCloudinaryConfigured) {
    throw new Error('Cloudinary is not configured');
  }
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'keycult/products',
    resource_type: 'image',
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  });
  return result.secure_url;
}

export { cloudinary };
