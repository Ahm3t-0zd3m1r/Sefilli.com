import { getAuth } from 'firebase/auth';
import {
  uploadBytes as baseUploadBytes,
  uploadBytesResumable as baseUploadBytesResumable,
} from 'firebase/storage';
export * from 'firebase/storage';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

function getByteSize(data: Blob | Uint8Array | ArrayBuffer): number {
  if (data instanceof Blob) {
    return data.size;
  }
  if (data instanceof Uint8Array) {
    return data.byteLength;
  }
  return data.byteLength;
}

function createStorageError(message: string, code: string) {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

function assertUploadAllowed(data: Blob | Uint8Array | ArrayBuffer) {
  const user = getAuth().currentUser;
  if (!user) {
    throw createStorageError('Fotograf yuklemek icin once giris yapmalisiniz.', 'storage/unauthenticated');
  }

  if (getByteSize(data) > MAX_UPLOAD_SIZE) {
    throw createStorageError('Fotograf boyutu 10 MB sinirini asiyor.', 'storage/file-too-large');
  }
}

export function uploadBytes(...args: Parameters<typeof baseUploadBytes>) {
  assertUploadAllowed(args[1]);
  return baseUploadBytes(...args);
}

export function uploadBytesResumable(...args: Parameters<typeof baseUploadBytesResumable>) {
  assertUploadAllowed(args[1]);
  return baseUploadBytesResumable(...args);
}
