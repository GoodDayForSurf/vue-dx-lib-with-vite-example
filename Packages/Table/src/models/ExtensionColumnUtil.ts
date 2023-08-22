import type { IExtensionColumn } from './IExtensionColumn';
import type { IExtensionColumnValue } from './IExtensionColumnValue';

export class ExtensionColumnUtil {
  public static determineValueColumnName(definition: IExtensionColumn): string {
    if (definition.type.toLowerCase() === 'double') {
      return 'doubleValue';
    } else if (definition.type.toLowerCase() === 'bool') {
      return 'boolValue';
    } else if (definition.type.toLowerCase() === 'string') {
      return 'stringValue';
    }
    throw new Error(`unable to determine value column for extension column of type ${definition.type}`);
  }

  public static applyValue(definition: IExtensionColumn, extensionValue: IExtensionColumnValue, value: any) {
    if (definition.type.toLowerCase() === 'double') {
      extensionValue.doubleValue = value;
      return;
    } else if (definition.type.toLowerCase() === 'bool') {
      extensionValue.boolValue = value;
      return;
    } else if (definition.type.toLowerCase() === 'string') {
      extensionValue.stringValue = value;
      return;
    }
    throw new Error(`unable to determine value column for extension column of type ${definition.type}`);
  }
}
