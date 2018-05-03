import Vue from 'vue';
import VueExcelDownload from './ExcelDownload.vue';

if (document.querySelector('#vue-excel-download__container')) {
  Vue.component('vue-excel-download', VueExcelDownload);

  new Vue({
    el: '#vue-excel-download__container'
  });
}
