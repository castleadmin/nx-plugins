import { AppType } from '../cdk-app/app-type';

export interface E2ESchema {
  project: string;
  appType: AppType;
  skipFormat?: boolean;
}
