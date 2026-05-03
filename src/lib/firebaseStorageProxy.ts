import { getAuth } from 'firebase/auth';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes as baseUploadBytes,
} from '@firebase/storage';
export { getDownloadURL, getStorage, ref };
export * from '@firebase/storage';

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

type UploadData = Blob | Uint8Array | ArrayBuffer;
type ProgressCallback = (snapshot: any) => void;
type ErrorCallback = (error: Error) => void;
type CompleteCallback = () => void;

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

function assertUploadAllowed(data: UploadData) {
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

export function uploadBytesResumable(storageRef: any, data: UploadData, metadata?: Record<string, unknown>) {
  assertUploadAllowed(data);

  const listeners = {
    progress: [] as ProgressCallback[],
    error: [] as ErrorCallback[],
    complete: [] as CompleteCallback[],
  };

  const snapshot = {
    ref: storageRef,
    metadata: metadata ?? null,
    state: 'running',
    bytesTransferred: 0,
    totalBytes: getByteSize(data),
    task: null as any,
  };

  const promise = baseUploadBytes(storageRef, data as any, metadata as any)
    .then((result) => {
      snapshot.state = 'success';
      snapshot.bytesTransferred = snapshot.totalBytes;
      snapshot.ref = result.ref;
      snapshot.metadata = result.metadata;
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

export async function resolveDownloadURL(taskOrRef: any) {
  const target = taskOrRef?.snapshot?.ref ?? taskOrRef?.ref ?? taskOrRef;
  return getDownloadURL(target);
}
