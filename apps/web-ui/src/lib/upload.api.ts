import { post, get, del, http } from './http';

export interface UploadFileResponse {
  url: string;
  filename: string;
  objectName: string;
  size: number;
  mimeType: string;
  bucket: string;
}

export interface MultipleUploadResponse {
  files: UploadFileResponse[];
  total: number;
}

export interface FileUrlResponse {
  url: string;
  expiresIn: number;
}

export async function uploadFile(
  file: File,
  bucket?: string,
  folder?: string
): Promise<UploadFileResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const params: Record<string, string> = {};
  if (bucket) params.bucket = bucket;
  if (folder) params.folder = folder;

  const queryString = new URLSearchParams(params).toString();
  const url = `/api/upload${queryString ? `?${queryString}` : ''}`;

  // Use http() helper to ensure 401 errors trigger token refresh
  const response = await http().post<UploadFileResponse>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true, // Required to send cookies
  });
  return response.data;
}

export async function uploadMultipleFiles(
  files: File[],
  bucket?: string,
  folder?: string
): Promise<MultipleUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const params: Record<string, string> = {};
  if (bucket) params.bucket = bucket;
  if (folder) params.folder = folder;

  const queryString = new URLSearchParams(params).toString();
  const url = `/api/upload/multiple${queryString ? `?${queryString}` : ''}`;

  // Use http() helper to ensure 401 errors trigger token refresh
  const response = await http().post<MultipleUploadResponse>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    withCredentials: true, // Required to send cookies
  });
  return response.data;
}

export async function getFileUrl(
  bucket: string,
  objectName: string,
  expiresIn?: number
): Promise<FileUrlResponse> {
  const params: Record<string, string> = {};
  if (expiresIn) params.expiresIn = expiresIn.toString();

  const queryString = new URLSearchParams(params).toString();
  const url = `/api/files/${bucket}/${objectName}${queryString ? `?${queryString}` : ''}`;

  return get<FileUrlResponse>(url);
}

export async function deleteFile(
  bucket: string,
  objectName: string
): Promise<{ message: string }> {
  return del<{ message: string }>(`/api/files/${bucket}/${objectName}`);
}

export async function listFiles(
  bucket: string,
  prefix?: string
): Promise<string[]> {
  const params: Record<string, string> = {};
  if (prefix) params.prefix = prefix;

  const queryString = new URLSearchParams(params).toString();
  const url = `/api/files/${bucket}${queryString ? `?${queryString}` : ''}`;

  return get<string[]>(url);
}

