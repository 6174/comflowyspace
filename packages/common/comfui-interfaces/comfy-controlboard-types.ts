/**
 * Controlboard Config Data
 */
export type ControlBoardConfig = {
  nodes: ControlBoardNodeConfig[];
}

/**
 * Controlboard Node Config
 */
export type ControlBoardNodeConfig = {
  id: string;
  fields: string[];
  apiInputFields: string[];
  apiInputFieldsNameMapping: Record<string, string>;
  apiOutputFields: string[];
  apiOutputFieldsNameMapping: Record<string, string>;
}