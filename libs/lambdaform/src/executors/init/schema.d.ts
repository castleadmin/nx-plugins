export interface InitExecutorSchema {
  workspace?: string;
  createWorkspace: boolean;
  interactive: boolean;
  upgrade: boolean;
  args?: string;
  terraformDirectory: string;
}
