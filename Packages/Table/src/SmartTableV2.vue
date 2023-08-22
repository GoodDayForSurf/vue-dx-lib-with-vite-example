<template>
  <SimpleDxButton text="DX-BUTTON"/>
  <SmartSwitch :value="true"/>
  <DxDataGrid
    ref="dxDataGrid"
    v-if="forceRefreshField"
    :id="tableId"
    :data-source="dataStore"
    column-width="auto"
    :show-column-lines="false"
    :show-row-lines="true"
    :row-alternation-enabled="false"
    :hover-state-enabled="true"
    :allow-column-reordering="true"
    :allow-column-resizing="true"
    :focused-row-enabled="true"
    column-resizing-mode="widget"
    :column-min-width="50"
    :syncLookupFilterValues="false"
  >
    <DxRemoteOperations :filtering="true" :paging="true" :sorting="true" :summary="true" :grouping="true" :group-paging="true" />
    <DxKeyboardNavigation :edit-on-key-press="true" :enter-key-action="'moveFocus'" :enter-key-direction="'column'" />
    <DxFilterRow :visible="true" />
    <DxSorting mode="multiple" />
    <DxPaging :page-size="20" />
    <DxPager :visible="true" :allowed-page-sizes="[20, 50, 100]" :show-page-size-selector="true" :show-navigation-buttons="true" />
    <DxEditing
      v-if="readonly !== true"
      :allow-adding="!hideAddButton"
      :allow-updating="true"
      :allow-deleting="!hideDeleteButton"
      mode="cell"
    />
    <DxStateStoring :enabled="true" type="localStorage" :storage-key="tableId" />
    <DxColumnChooser :enabled="true" mode="select" emptyPanelText="Es sind keine Spalten versteckt" />

    <DxColumn type="buttons" v-if="hideFunctionColumn === false">
      <DxButton name="edit" />
      <DxButton name="delete" />
    </DxColumn>

    <slot />
    <template #master-detail="{ data }">
      <slot v-bind="data" name="master-detail-detail" />
    </template>
    <template #cell-template="{ data }">
      <slot v-bind="data" name="cell-template-slot" />
    </template>
    <DxColumn
      v-for="(extensionColumn, index) in getExtensionColumnsSorted"
      :key="`${extensionColumn.name}-${index}`"
      :data-field="extensionColumn.key"
      :caption="extensionColumn.name"
      :data-type="getInputTypeForExtensionColumn(extensionColumn.type)"
      :allow-sorting="false"
      :allow-editing="!extensionColumn.readOnly"
    >
      <DxRequiredRule v-if="extensionColumn.isRequired" :message="'Achtung! ' + extensionColumn.name + ' ist ein Pflichtfeld!'" />
    </DxColumn>
    <DxToolbar class="mb-2">
      <DxItem v-if="readonly !== true && hideAddButton !== true" name="addRowButton" location="before" />
      <DxItem location="before">
        <!--needs an empty element to get rendered in order for the slot to be applied correctly-->
        <span></span>
        <slot name="toolbar" />
      </DxItem>
      <DxItem location="after">
        <!--needs an empty element to get rendered in order for the slot to be applied correctly-->
        <span></span>
        <slot name="toolbar-after" />
      </DxItem>
      <DxItem location="after">
        <button class="btn btn-sm btn-secondary" @click="toggleFilters">
          <em class="fas fa-filter"></em>
        </button>
      </DxItem>
      <DxItem location="after">
        <button class="btn btn-sm btn-secondary" @click="resetState">
          <em class="fas fa-rotate-right"></em>
        </button>
      </DxItem>
      <DxItem location="after">
        <button class="btn btn-sm btn-secondary" @click="showColumnChooser">
          <em class="fas fa-columns-3"></em>
        </button>
      </DxItem>
    </DxToolbar>
  </DxDataGrid>
</template>

<script lang="ts">
import type DataSource from 'devextreme/data/data_source';
import {DxButton as SimpleDxButton} from 'devextreme-vue/button';
import {DxSwitch as SmartSwitch} from 'devextreme-vue/switch';
import {
  DxDataGrid,
  DxButton,
  DxPager,
  DxPaging,
  DxEditing,
  DxToolbar,
  DxItem,
  DxFilterRow,
  DxKeyboardNavigation,
  DxSorting,
  DxStateStoring,
  DxColumn,
  DxColumnChooser,
  DxRemoteOperations,
  DxRequiredRule,
} from 'devextreme-vue/data-grid';
import { locale, loadMessages } from 'devextreme/localization';
// @ts-ignore
import deMessages from 'devextreme/localization/messages/de.json';
import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'SmartTableV2',
  components: {
    SimpleDxButton,
    SmartSwitch,
    DxDataGrid,
    DxButton,
    DxPager,
    DxPaging,
    DxEditing,
    DxToolbar,
    DxItem,
    DxFilterRow,
    DxKeyboardNavigation,
    DxSorting,
    DxStateStoring,
    DxColumn,
    DxColumnChooser,
    DxRemoteOperations,
    DxRequiredRule,
  },
  props: {
    dataStore: {
      type: Object as PropType<DataSource<any, any> | any>,
      required: true,
    },
    tableId: { type: String, required: true },
    readonly: { type: Boolean, default: false },
    hideAddButton: { type: Boolean, default: false },
    hideDeleteButton: { type: Boolean, default: false },
    hideFunctionColumn: { type: Boolean, default: false },
    slotNames: {
      type: Object as PropType<string[] | undefined>,
      default: undefined,
      required: false,
    },
  },
  data: () => {
    return {
      forceRefreshField: true,
    };
  },
  created() {
    this.translate();
  },
  methods: {
    onFocusChanged(selectedRowsData: any): any {
      this.$emit('focusChanged', selectedRowsData);
      return selectedRowsData;
    },
    translate(): void {
      loadMessages(deMessages);
      locale('de');
    },
    resetState() {
      window.localStorage.removeItem(this.tableId);
      this.forceRefreshField = false;
      setTimeout(() => (this.forceRefreshField = true), 50);
    },

    showColumnChooser() {
      (this.$refs['dxDataGrid'] as any).instance.showColumnChooser();
    },

    toggleFilters() {
      const header = document.querySelector(`#${this.tableId} .dx-datagrid-headers.dx-datagrid-nowrap`);
      header?.classList.toggle('hide-filters');
    },

    getInputTypeForExtensionColumn(type: string): string {
      if (type.toLowerCase() === 'double') {
        return 'number';
      } else if (type.toLowerCase() === 'bool') {
        return 'boolean';
      } else {
        return 'string';
      }
    },
  },
  computed: {
    getExtensionColumnsSorted() {
      if (!this.dataStore?.store) return [];
      var dipDataStore: any = this.dataStore.store;
      return dipDataStore.expansionFieldList?.sort((a: any, b: any) => (a.key < b.key ? 1 : -1));
    },
  },
});
</script>
