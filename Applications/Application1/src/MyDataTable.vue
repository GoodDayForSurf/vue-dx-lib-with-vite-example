<template>
  <h2>DIP SmartTable Example</h2>
  <SmartTableV2
    tableId="employees"
    ref="employees"
    :dataStore="dataSource"
    key="Product_ID"
    :hideAddButton="true"
    :hideFunctionColumn="true"
  >
    <DxColumn data-field="ID" caption="ID" data-type="number" />
    <DxColumn data-field="FirstName" caption="Vorname" data-type="string" />
    <DxColumn data-field="LastName" caption="Nachname" data-type="string" />
  </SmartTableV2>
</template>

<script lang="ts">
import * as Odata from 'devextreme/data/odata/store';
import { defineComponent } from 'vue';
import { SmartTableV2 } from '@mytoolkit/table';
import DxColumn from 'devextreme-vue/data-grid';

console.log('-----odata----->', Odata);
declare interface Employee {
  ID: number;
  FirstName: string;
  LastName: string;
}

export default defineComponent({
  components: {
    DxColumn,
    SmartTableV2,
  },
  name: 'SmartTableExample',
  data() {
    return {
      dataSource: {
        store: {
          type: 'odata',
          url: 'https://js.devexpress.com/Demos/DevAV/odata/Products',
          key: 'Product_ID',
        },
        select: ['Product_ID', 'Product_Name', 'Product_Cost', 'Product_Sale_Price', 'Product_Retail_Price', 'Product_Current_Inventory'],
        filter: ['Product_Current_Inventory', '>', 0],
      },
    };
  },
});
</script>
