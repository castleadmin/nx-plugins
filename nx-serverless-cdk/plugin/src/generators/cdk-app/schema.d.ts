import { AppType } from './app-type';

export interface CdkAppSchema {
  name: string;
  directory?: string;
  type: AppType;
  skipFormat?: boolean;
}
