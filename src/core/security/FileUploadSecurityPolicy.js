/**
 * ============================================================
 * Habibi Bites — File Upload & Storage Security Policy
 * ============================================================
 * Audit Status: NO FILE UPLOAD FUNCTIONALITY CURRENTLY ACTIVE.
 *
 * All food images, assets, and icons are static files served
 * from the immutable /assets directory.
 *
 * If file uploads (e.g. food item image uploads in Admin) are
 * introduced in future versions, the security rules below MUST
 * be enforced.
 * ============================================================
 */

export const FILE_UPLOAD_POLICY = {
  /** Uploads currently disabled by default */
  allowUploads: false,

  /** Maximum allowed file size in bytes (2 MB) */
  maxSizeBytes: 2 * 1024 * 1024,

  /** Strict MIME type allowlist (images only) */
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],

  /** Allowed file extensions */
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],

  /** Storage path rules */
  storageBucket: 'food-media',
  isolatedFromWebRoot: true,
  preventExecutableExecution: true,
};

/**
 * Validates a File object against security policy (magic bytes, size, mime-type).
 *
 * @param {File} file
 * @returns {Promise<{ valid: boolean, reason?: string }>}
 */
export async function validateFileUploadSecurity(file) {
  if (!FILE_UPLOAD_POLICY.allowUploads) {
    return { valid: false, reason: 'File uploads are currently disabled on this platform.' };
  }

  if (!file) {
    return { valid: false, reason: 'No file provided.' };
  }

  // 1. Validate File Size
  if (file.size > FILE_UPLOAD_POLICY.maxSizeBytes) {
    return { valid: false, reason: `File size exceeds the 2 MB limit (received ${(file.size / 1024 / 1024).toFixed(2)} MB).` };
  }

  // 2. Validate MIME Type declaration
  if (!FILE_UPLOAD_POLICY.allowedMimeTypes.includes(file.type)) {
    return { valid: false, reason: `Invalid file type (${file.type}). Only JPG, PNG, and WebP images are allowed.` };
  }

  // 3. Validate File Extension
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  if (!FILE_UPLOAD_POLICY.allowedExtensions.includes(ext)) {
    return { valid: false, reason: `Unsafe file extension (${ext}).` };
  }

  // 4. Validate Magic Bytes Header (Prevent renamed executable binaries)
  try {
    const isHeaderValid = await verifyMagicBytes(file);
    if (!isHeaderValid) {
      return { valid: false, reason: 'File content header does not match declared image format (content spoofing detected).' };
    }
  } catch (err) {
    return { valid: false, reason: 'Failed to inspect file content header.' };
  }

  return { valid: true };
}

/**
 * Inspects binary magic bytes of the file.
 * @param {File} file
 * @returns {Promise<boolean>}
 */
async function verifyMagicBytes(file) {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // JPEG magic bytes: FF D8 FF
  const isJpeg = bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF;

  // PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47;

  // WebP magic bytes: 52 49 46 46 (RIFF) ... 57 41 56 45 (WEBP)
  const isWebp = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;

  return isJpeg || isPng || isWebp;
}
