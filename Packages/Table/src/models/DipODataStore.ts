import ODataStore, { type Options } from 'devextreme/data/odata/store';
import { Guid } from 'guid-typescript';
import type { IExtensionColumn } from './IExtensionColumn';
import type { IExtensionColumnValue } from './IExtensionColumnValue';
import type { IColumnExtensionsRequest } from './IColumnExtensionsRequest';
import { ExtensionColumnUtil } from './ExtensionColumnUtil';
import type { AxiosInstance } from 'axios';

export default class DipODataStore<TItem = any, TKey = any> extends ODataStore {
  public expansionFieldList: IExtensionColumn[];
  constructor(options: Options<TItem, TKey>, expansionFieldList: IExtensionColumn[]) {
    super({
      ...options,
      beforeSend: (beforeSendOptions) => {
        // the payload contained in beforeSendOptions is a reference to the current row in the table
        // modifications to the payload lead to modifications of that row itself
        // therefore we make a safe copy to prepare for the API call
        const safeCopiedPayload = JSON.parse(JSON.stringify(beforeSendOptions.payload));
        beforeSendOptions.payload = safeCopiedPayload;

        if (options.beforeSend) {
          options.beforeSend(beforeSendOptions);
        }

        if (safeCopiedPayload && beforeSendOptions.method.toLowerCase() === 'post') {
          beforeSendOptions.payload = this.pivotPayloadPost(safeCopiedPayload);
        } else if (safeCopiedPayload && beforeSendOptions.method.toLowerCase() === 'patch') {
          beforeSendOptions.payload = this.pivotPayloadPatch(safeCopiedPayload, beforeSendOptions.url);
        }
        if (beforeSendOptions.params.$filter) {
          beforeSendOptions.params.$filter = this.enhanceFilterQueryForExtensionValues(beforeSendOptions.params.$filter);
        }
      },
      onLoaded: (result, _) => {
        if (options.onLoaded) {
          options.onLoaded(result, _);
        }

        this.expansionFieldList.forEach((expansionField: IExtensionColumn) => {
          result.forEach((entry) => {
            const originalExtensionValue = entry.extensionValues.find((ev: any) => ev.columnExtensionId._value == expansionField.key);
            if (originalExtensionValue) {
              entry[expansionField.key] = originalExtensionValue[ExtensionColumnUtil.determineValueColumnName(expansionField)];
            }
          });
        });
      },
    });
    this.expansionFieldList = expansionFieldList;
  }

  public static async forODataV4EndpointWithDynamicColumns<TItem = any, TKey = any>(
    options: Options<TItem, TKey>,
    columnExtensionEndpoint: string,
    errorHandler: (error: any | undefined) => void,
    axios: AxiosInstance,
  ): Promise<DipODataStore> {
    const fetchedExtensionColumns = await axios.get<IColumnExtensionsRequest>(columnExtensionEndpoint).catch((error) => {
      return null;
    });

    let expansionFieldList: IExtensionColumn[] = [];
    if (fetchedExtensionColumns != null) {
      expansionFieldList = fetchedExtensionColumns.data.value;
    }

    options.version = 4;
    options.errorHandler = (error) => {
      if (error.errorDetails == null) {
        errorHandler(undefined);
        return;
      }
      errorHandler(error.errorDetails);
    };

    return new DipODataStore(options, expansionFieldList);
  }

  public static forODataV4Endpoint<TItem = any, TKey = any>(
    options: Options<TItem, TKey>,
    expansionFieldList: IExtensionColumn[],
    errorHandler: (error: any | undefined) => void,
  ): DipODataStore {
    options.version = 4;
    options.errorHandler = (error) => {
      if (error.errorDetails == null) {
        errorHandler(undefined);
        return;
      }
      errorHandler(error.errorDetails);
    };
    return new DipODataStore(options, expansionFieldList);
  }

  public pivotPayloadPatch(payload: any, url: string): any {
    const extensionValues: any[] = [];
    const entityKey = url.replace(/(.*\(|\))/gi, '');

    this.expansionFieldList.forEach((expansionField) => {
      if (payload[expansionField.key] == null) {
        return;
      }

      const extensionValueToAdd = {
        entityKey: entityKey,
        columnExtensionId: expansionField.key,
      } as IExtensionColumnValue;
      ExtensionColumnUtil.applyValue(expansionField, extensionValueToAdd, payload[expansionField.key]);
      extensionValues.push(extensionValueToAdd);
      delete payload[expansionField.key];
    });

    delete payload.extensionValues;
    if (extensionValues?.length > 0) {
      payload.extensionValues = extensionValues;
    }

    return payload;
  }

  public pivotPayloadPost(payload: any): any {
    const extensionValues: any = [];
    const guid = Guid.create();

    this.expansionFieldList.forEach((expansionField) => {
      if (payload[expansionField.key] == null) {
        return;
      }

      const extensionValueToAdd = {
        entityKey: guid.toString(),
        columnExtensionId: expansionField.key,
      } as IExtensionColumnValue;
      ExtensionColumnUtil.applyValue(expansionField, extensionValueToAdd, payload[expansionField.key]);
      extensionValues.push(extensionValueToAdd);
      delete payload[expansionField.key];
    });

    payload.key = guid.toString();
    delete payload.extensionValues;
    if (extensionValues?.length > 0) {
      payload.extensionValues = extensionValues;
    }

    return payload;
  }

  public enhanceFilterQueryForExtensionValues(inputQuery: string): string {
    this.expansionFieldList.forEach((expansionField) => {
      const valueField = ExtensionColumnUtil.determineValueColumnName(expansionField);
      inputQuery = inputQuery.replace(expansionField.key, `extensionValues[${expansionField.key}]/${valueField}`);
    });
    inputQuery = this.handleContainsExtensionQueries(inputQuery);
    inputQuery = this.handleStartsWithExtensionQueries(inputQuery);
    inputQuery = this.handleEndsWithExtensionQueries(inputQuery);
    inputQuery = this.handleEqualsExtensionQueries(inputQuery);
    inputQuery = this.handleNotEqualsExtensionQueries(inputQuery);

    return inputQuery;
  }

  private handleContainsExtensionQueries(inputFilter: string): string {
    const containQueriesRegex =
      /(?<inverted>not )?contains\(tolower\(extensionValues\[(?<number>[\d\w-]+)\]\/(?<field>\w+)\),\s?(?<value>(('[^']*')))\)/gi;
    return inputFilter.replace(
      containQueriesRegex,
      `extensionValues/any(s: $<inverted>contains(tolower(s/$<field>), $<value>) and s/columnExtensionId eq $<number>)`,
    );
  }

  private handleStartsWithExtensionQueries(inputFilter: string): string {
    const startsWithQueriesRegex =
      /startswith\(tolower\(extensionValues\[(?<number>[\d\w-]+)\]\/(?<field>\w+)\),\s?(?<value>(('[^']*')))\)/gi;
    return inputFilter.replace(
      startsWithQueriesRegex,
      `extensionValues/any(s: startswith(tolower(s/$<field>), $<value>) and s/columnExtensionId eq $<number>)`,
    );
  }

  private handleEndsWithExtensionQueries(inputFilter: string): string {
    const endsWithQueriesRegex = /endswith\(tolower\(extensionValues\[(?<number>[\d\w-]+)\]\/(?<field>\w+)\),\s?(?<value>(('[^']*')))\)/gi;
    return inputFilter.replace(
      endsWithQueriesRegex,
      `extensionValues/any(s: endswith(tolower(s/$<field>), $<value>) and s/columnExtensionId eq $<number>)`,
    );
  }

  private handleEqualsExtensionQueries(inputFilter: string): string {
    const equalsQueriesRegex = /extensionValues\[(?<number>[\d\w-]+)\]\/(?<field>\w+) eq (?<value>(('[^']*'))|(true|false)|[\d.]*)/gi;
    return inputFilter.replace(equalsQueriesRegex, `extensionValues/any(s: s/$<field> eq $<value> and s/columnExtensionId eq $<number>)`);
  }

  private handleNotEqualsExtensionQueries(inputFilter: string): string {
    const notEqualsQueriesRegex = /extensionValues\[(?<number>[\d\w-]+)\]\/(?<field>\w+) ne (?<value>(('[^']*'))|(true|false)|[\d.]*)/gi;
    return inputFilter.replace(
      notEqualsQueriesRegex,
      `extensionValues/any(s: s/$<field> ne $<value> and s/columnExtensionId eq $<number>)`,
    );
  }
}
