import { AppType } from '../cdk-app/app-type';

export interface E2ESchema {
  name: string;
  directory?: string;
  project: string;
  type: AppType;
  skipFormat?: boolean;
}
