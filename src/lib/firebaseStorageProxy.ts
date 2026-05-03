import { getAuth } from 'firebase/auth';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

type UploadData = Blob | Uint8Array | ArrayBuffer;
type ProgressCallback = (snapshot: any) => void;
type ErrorCallback = (error: Error) => void;
type CompleteCallback = () => void;

type StorageRefLike = {
  fullPath: string;
  name: string;
  bucket: string;
  parent: null;
  root: null;
  __downloadURL?: string;
  __metadata?: Record<string, unknown> | null;
};

function getByteSize(data: UploadData): number {
  if (data instanceof Blob) return data.size;
  if (data instanceof Uint8Array) return data.byteLength;
  return data.byteLength;
}

function createStorageError(message: string, code: string) {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

function sanitizeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9-_/.]/g, '-').replace(/-+/g, '-');
}

function buildPublicId(storageRef: StorageRefLike) {
  const baseName = storageRef.name.replace(/\.[^.]+$/, '');
  const safeBaseName = sanitizeSegment(baseName || 'upload');
  const suffix = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10);
  return `${safeBaseName}-${suffix}`;
}

function assertUploadAllowed(data: UploadData) {
  const user = getAuth().currentUser;
  if (!user) {
    throw createStorageError('Fotograf yuklemek icin once giris yapmalisiniz.', 'storage/unauthenticated');
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw createStorageError('Cloudinary ayarlari eksik. Vercel env degiskenlerini kontrol edin.', 'storage/missing-config');
  }

  if (getByteSize(data) > MAX_UPLOAD_SIZE) {
    throw createStorageError('Fotograf boyutu 10 MB sinirini asiyor.', 'storage/file-too-large');
  }

  if (data instanceof Blob && data.type && !ALLOWED_IMAGE_TYPES.has(data.type)) {
    throw createStorageError('Sadece JPG, PNG, WEBP veya GIF yukleyebilirsiniz.', 'storage/invalid-file-type');
  }
}

function normalizeBlob(data: UploadData): Blob {
  if (data instanceof Blob) return data;
  if (data instanceof Uint8Array) return new Blob([data]);
  return new Blob([data]);
}

function buildRef(path: string): StorageRefLike {
  const segments = path.split('/').filter(Boolean);
  return {
    fullPath: path,
    name: segments[segments.length - 1] ?? 'upload',
    bucket: 'cloudinary',
    parent: null,
    root: null,
  };
}

async function uploadToCloudinary(storageRef: StorageRefLike, data: UploadData) {
  assertUploadAllowed(data);

  const formData = new FormData();
  const normalizedData = normalizeBlob(data);
  const folder = sanitizeSegment(storageRef.fullPath.replace(/\/$/, '').split('/').slice(0, -1).join('/'));
  formData.append('file', normalizedData, storageRef.name);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  if (folder) {
    formData.append('folder', folder);
  }
  formData.append('public_id', buildPublicId(storageRef));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || typeof payload?.secure_url !== 'string') {
    const message = typeof payload?.error?.message === 'string'
      ? payload.error.message
      : 'Cloudinary yukleme istegi basarisiz oldu.';
    throw createStorageError(message, 'storage/upload-failed');
  }

  storageRef.__downloadURL = payload.secure_url;
  storageRef.__metadata = {
    bytes: payload.bytes ?? getByteSize(data),
    format: payload.format ?? null,
    public_id: payload.public_id ?? null,
    version: payload.version ?? null,
  };

  return {
    ref: storageRef,
    metadata: storageRef.__metadata,
  };
}

export function getStorage() {
  return { service: 'cloudinary' };
}

export function ref(_storage: unknown, path: string): StorageRefLike {
  return buildRef(path);
}

export async function getDownloadURL(storageRef: StorageRefLike) {
  if (storageRef.__downloadURL) {
    return storageRef.__downloadURL;
  }
  throw createStorageError('Yuklenen dosya URL bilgisi bulunamadi.', 'storage/missing-download-url');
}

export function uploadBytes(storageRef: StorageRefLike, data: UploadData) {
  return uploadToCloudinary(storageRef, data);
}

export function uploadBytesResumable(storageRef: StorageRefLike, data: UploadData) {
  const listeners = {
    progress: [] as ProgressCallback[],
    error: [] as ErrorCallback[],
    complete: [] as CompleteCallback[],
  };

  const snapshot = {
    ref: storageRef,
    metadata: null as Record<string, unknown> | null,
    state: 'running',
    bytesTransferred: 0,
    totalBytes: getByteSize(data),
    task: null as any,
  };

  const promise = uploadToCloudinary(storageRef, data)
    .then((result) => {
      snapshot.state = 'success';
      snapshot.bytesTransferred = snapshot.totalBytes;
      snapshot.ref = result.ref;
      snapshot.metadata = result.metadata ?? null;
      listeners.progress.forEach((callback) => callback({ ...snapshot }));
      listeners.complete.forEach((callback) => callback());
      return result;
    })
    .catch((error) => {
      snapshot.state = 'error';
      listeners.error.forEach((callback) => callback(error));
      throw error;
    });

  const task = {
    snapshot,
    on(event: string, next?: ProgressCallback | { next?: ProgressCallback; error?: ErrorCallback; complete?: CompleteCallback }, error?: ErrorCallback, complete?: CompleteCallback) {
      if (event !== 'state_changed') {
        return () => {};
      }

      if (typeof next === 'function') {
        listeners.progress.push(next);
        if (error) listeners.error.push(error);
        if (complete) listeners.complete.push(complete);
      } else if (next && typeof next === 'object') {
        if (next.next) listeners.progress.push(next.next);
        if (next.error) listeners.error.push(next.error);
        if (next.complete) listeners.complete.push(next.complete);
      }

      return () => {};
    },
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };

  snapshot.task = task;

  queueMicrotask(() => {
    listeners.progress.forEach((callback) => callback({ ...snapshot }));
  });

  return task;
}
