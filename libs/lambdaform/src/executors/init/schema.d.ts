export interface InitExecutorSchema {
  workspace?: string;
  interactive: boolean;
  upgrade: boolean;
  args?: string;
  terraformDirectory: string;
}
