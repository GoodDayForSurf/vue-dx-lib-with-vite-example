<template>
  <h2>DIP SmartTable Example</h2>
  <SmartTableV2 tableId="employees" ref="employees" :dataStore="employees" key="ID" :hideAddButton="true" :hideFunctionColumn="true">
    <DxColumn data-field="ID" caption="ID" data-type="number" />
    <DxColumn data-field="FirstName" caption="Vorname" data-type="string" />
    <DxColumn data-field="LastName" caption="Nachname" data-type="string" />
  </SmartTableV2>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import SmartTableV2 from '../SmartTableV2.vue';

declare interface Employee {
  ID: number;
  FirstName: string;
  LastName: string;
}

export default defineComponent({
  name: 'SmartTableExample',
  data() {
    return {
      employees: [
        { ID: 1, FirstName: 'Sandra', LastName: 'Johnson' },
        { ID: 2, FirstName: 'James', LastName: 'Scott' },
        { ID: 3, FirstName: 'Nancy', LastName: 'Smith' },
      ] as Employee[],
    };
  },
});
</script>
