export interface PlanExecutorSchema {
  workspace?: string;
  interactive: boolean;
  args?: string;
  planOutput: string;
  terraformDirectory: string;
}
