import { ConflictException, Injectable } from '@nestjs/common';
import * as Minio from 'minio';
import { Readable } from 'stream';

@Injectable()
export class MinioService {
  private internalMinioClient: Minio.Client;
  private publicMinioClient: Minio.Client;

  constructor() {
    this.internalMinioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number.parseInt(process.env.MINIO_PORT),
      accessKey: process.env.MINIO_ACCESSKEY,
      secretKey: process.env.MINIO_SECRETKEY,
      useSSL: process.env.MINIO_INTERNAL_SSL == 'true',
    });
    this.publicMinioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT_PUBLIC,
      accessKey: process.env.MINIO_ACCESSKEY,
      secretKey: process.env.MINIO_SECRETKEY,
      ...(process.env.IS_LOCAL === 'true' && {
        region: process.env.MINIO_REGION,
        useSSL: process.env.MINIO_INTERNAL_SSL == 'true',
      }),
    });
  }

  async getPresignedUrl(
    bucketName: string,
    objectName: string,
    expiry: number,
  ): Promise<string> {
    try {
      const url = await this.publicMinioClient.presignedGetObject(
        bucketName,
        objectName,
        expiry,
      );
      return url;
    } catch (error) {
      console.error(
        `Error generating presigned URL: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async listObjects(bucket: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const objectsList: string[] = [];
      const stream = this.internalMinioClient.listObjectsV2(bucket, '', true);

      stream.on('data', (obj) => objectsList.push(obj.name));
      stream.on('end', () => resolve(objectsList));
      stream.on('error', (err) => {
        const error = new ConflictException(`MINIO ERROR - ${err.message}`);
        reject(error);
      });
    });
  }

  async uploadStream(
    bucket: string,
    objectName: string,
    stream: Readable,
    size: number,
    mimeType: string,
  ) {
    try {
      await this.internalMinioClient.putObject(
        bucket,
        objectName,
        stream,
        size,
        {
          'Content-Type': mimeType,
        },
      );
    } catch (error) {
      console.error('Error uploading object to MinIO:', error);
      throw error;
    }
  }
}
