export interface HandlerGeneratorSchema {
  handlerName: string;
  project: string;
  s3Upload: boolean;
  xray: boolean;
  skipFormat?: boolean;
}
