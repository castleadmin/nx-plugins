import { AppType } from './app-type';

export interface CdkAppSchema {
  appName: string;
  appType: AppType;
  skipFormat?: boolean;
}
