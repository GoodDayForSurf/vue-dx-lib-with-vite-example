<template>
  <div>
    Hello World
    <MyDataTable />
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import MyDataTable from '@/MyDataTable.vue';

export default defineComponent({
  name: 'App',
  components: {
    MyDataTable,
  },
  data() {
    return {};
  },
});
</script>
<style lang="scss">
@import '~@/../node_modules/devextreme/dist/css/dx.light.compact.css';
</style>
