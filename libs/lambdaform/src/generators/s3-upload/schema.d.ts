export interface S3UploadGeneratorSchema {
  bucketName: string;
  project: string;
  skipFormat?: boolean;
}
