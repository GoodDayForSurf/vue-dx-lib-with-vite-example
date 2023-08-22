export interface IExtensionColumnValue {
  key: string;
  columnExtensionId: string;
  entityKey: string;
  stringValue: string;
  doubleValue: number;
  boolValue: boolean;
  isRequired: boolean;
  readOnly: boolean;
}
